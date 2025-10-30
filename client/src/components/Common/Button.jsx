import { variants } from "../../constants";

export default function Button({ color, text }) {
  return (
    <button className={`w-[200px] px-4 py-2 rounded-2xl ${variants[color]}`}>
      {text}
    </button>
  );
}
