import { useContext, useEffect, useState, createContext } from "react";
import { useAuth } from "./AuthContext";
import { createBlog, getBlogsFromApi, rateBlog } from "../api/blog.api";

const BlogContext = createContext();

export function BlogProvider({ children }) {
  const [blogs, setBlogs] = useState([]);
  const { userConnected } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogsFromApi();
        // on ajoute un compteur local "commentCount" (fallback à 0)
        const withCounts = (data || []).map((b) => ({
          ...b,
          commentCount:
            typeof b.commentCount === "number"
              ? b.commentCount
              : Array.isArray(b.comments)
              ? b.comments.length
              : 0,
        }));
        setBlogs(withCounts);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBlogs();
  }, []);

  const addBlog = async (values) => {
    try {
      const newBlog = await createBlog(values);
      setBlogs((prev) => [{ ...newBlog, commentCount: 0 }, ...prev]);
    } catch (error) {
      console.log(error);
    }
  };

  const rateInBlogContext = async (blogId, value) => {
    try {
      const newRating = await rateBlog(blogId, value);
      setBlogs((prev) =>
        prev.map((blog) => {
          if (blog._id === blogId) {
            const filteredRatings = (blog.ratings || []).filter((r) => {
              const authorId =
                typeof r.author === "string" ? r.author : r.author?._id;
              return userConnected ? authorId !== userConnected._id : true;
            });
            const newRatings = [...filteredRatings, newRating];
            return { ...blog, ratings: newRatings };
          }
          return blog;
        })
      );
      return newRating;
    } catch (error) {
      console.log(error);
    }
  };

  // --------- Nouveaux helpers pour refléter le compteur de commentaires ----------
  const incrementCommentCount = (blogId) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b._id === blogId
          ? {
              ...b,
              commentCount:
                (typeof b.commentCount === "number" ? b.commentCount : 0) + 1,
            }
          : b
      )
    );
  };

  const decrementCommentCount = (blogId) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b._id === blogId
          ? {
              ...b,
              commentCount: Math.max(
                0,
                (typeof b.commentCount === "number" ? b.commentCount : 0) - 1
              ),
            }
          : b
      )
    );
  };

  // remplace un blog par sa version fraîche (utile après refetch par id)
  const replaceBlog = (freshBlog) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b._id === freshBlog._id
          ? {
              ...freshBlog,
              commentCount:
                typeof freshBlog.commentCount === "number"
                  ? freshBlog.commentCount
                  : Array.isArray(freshBlog.comments)
                  ? freshBlog.comments.length
                  : 0,
            }
          : b
      )
    );
  };

  return (
    <BlogContext.Provider
      value={{
        blogs,
        addBlog,
        rateInBlogContext,
        incrementCommentCount,
        decrementCommentCount,
        replaceBlog,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}
