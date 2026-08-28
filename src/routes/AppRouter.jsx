import {
  Route,
  Routes,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "./ProtectedRoute";

import HomePage from "../pages/public/HomePage";
import ProjectsPage from "../pages/public/ProjectsPage";
import ProjectDetailPage from "../pages/public/ProjectDetailPage";
import NotFoundPage from "../pages/public/NotFoundPage";

import LoginPage from "../pages/admin/LoginPage";
import DashboardPage from "../pages/admin/DashboardPage";
import ProjectsAdminPage from "../pages/admin/ProjectsAdminPage";
import BookingsAdminPage from "../pages/admin/BookingsAdminPage";
import TestimonialsAdminPage from "../pages/admin/TestimonialsAdminPage";
import LeadsAdminPage from "../pages/admin/LeadsAdminPage";
import ExperiencesAdminPage from "../pages/admin/ExperiencesAdminPage";
import CertificationsAdminPage from "../pages/admin/CertificationsAdminPage";
import ServicesAdminPage from "../pages/admin/ServicesAdminPage";
import ConsultingServicesAdminPage from "../pages/admin/ConsultingAdminPage";
import AvailabilityAdminPage from "../pages/admin/AvailabilityAdminPage";

function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC */}

      <Route
        element={
          <PublicLayout />
        }
      >
        <Route
          path="/"
          element={
            <HomePage />
          }
        />

        <Route
          path="/projects"
          element={
            <ProjectsPage />
          }
        />

        <Route
          path="/projects/:slug"
          element={
            <ProjectDetailPage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <NotFoundPage />
        }
      />

      {/* ADMIN LOGIN */}

      <Route
        path="/admin/login"
        element={
          <LoginPage />
        }
      />

      {/* ADMIN PROTECTED */}

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          path="/admin"
          element={
            <AdminLayout />
          }
        >
          <Route
            index
            element={
              <DashboardPage />
            }
          />

          <Route
            path="projects"
            element={
              <ProjectsAdminPage />
            }
          />

          <Route
            path="bookings"
            element={
              <BookingsAdminPage />
            }
          />

          <Route
            path="testimonials"
            element={
              <TestimonialsAdminPage />
            }
          />

          <Route
            path="leads"
            element={
              <LeadsAdminPage />
            }
          />

          <Route
            path="experiences"
            element={<ExperiencesAdminPage />}
          />

          <Route
            path="certifications"
            element={<CertificationsAdminPage />}
          />

          <Route
            path="services"
            element={<ServicesAdminPage />}
          />

          <Route
            path="consulting-services"
            element={<ConsultingServicesAdminPage />}
          />

          <Route
            path="availability"
            element={<AvailabilityAdminPage />}
          />


        </Route>
      </Route>
    </Routes>
  );
}

export default AppRouter;