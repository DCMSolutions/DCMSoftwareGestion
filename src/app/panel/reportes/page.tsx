import LockerOcupationPage from "./page-client";

export default async function Reportes() {
  // Ya no requiere admin (movido de mantenimiento)
  // const isAdmin = auth().protect().sessionClaims.metadata.role == "admin";
  // if (!isAdmin) {
  //   return <div></div>;
  // }
  
  return <LockerOcupationPage />;
}
