import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function LogoutButton() {
  const handleLogout = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Marca a sessão como inativa no Firestore
        await updateDoc(doc(db, "sessions", user.uid), {
          active: false,
        });

        // Faz logout no Firebase
        await signOut(auth);

        // Limpa dados locais
        localStorage.removeItem("role");
        localStorage.removeItem("deviceId");

        // Redireciona para login
        window.location.href = "/login";
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-error">
      Logout
    </button>
  );
}
