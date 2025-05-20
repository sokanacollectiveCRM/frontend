import { Route } from "react-router-dom";
import Teams from "./teams";
import { PrivateRoute } from "@/common/components/routes/ProtectedRoutes";



const TeamRoutes = () => (
    <Route>
      <Route element={<PrivateRoute/>} >
        <Route path='team' element = {<Teams />} />
      </Route>
    </Route>
  )
  
  export default TeamRoutes