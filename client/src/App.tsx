import React from "react";
import AddActualiteModal from "./pages/Actualites/AddActualiteModal";

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="mb-4">Test du modal AddActualiteModal</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Ouvrir le modal
        </button>

        <AddActualiteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;
