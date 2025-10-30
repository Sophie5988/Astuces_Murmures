import { NavLink } from "react-router-dom";

export default function Card({ blog }) {
  return (
    <NavLink to={`/blogdetails/${blog._id}`}>
      <div className="border border-gray-400 rounded-lg m-4">
        <div className="aspect-[3/2]">
          <img
            src={blog.image}
            alt={blog.titre}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <p className="text-lg text-blue-500">{blog.titre}</p>
          <p className="text-base">{blog.texte}</p>
          <p className="text-[14px] text-red-400 text-left">
            Créé le {blog.date}
          </p>
        </div>
      </div>
    </NavLink>
  );
}
