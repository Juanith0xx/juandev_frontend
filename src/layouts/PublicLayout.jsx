import {
  Outlet,
} from "react-router-dom";

import usePublicMotion from "../hooks/usePublicMotion";

function PublicLayout() {
  usePublicMotion();

  return (
    <div
      data-public-motion-root
      className="
        theme-page
        min-h-screen
      "
    >
      <Outlet />
    </div>
  );
}

export default PublicLayout;
