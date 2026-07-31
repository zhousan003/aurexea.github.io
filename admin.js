const adminLinks = document.querySelectorAll("[data-admin-link]");
const adminViews = document.querySelectorAll("[data-admin-view]");

function showAdminView(name) {
  adminViews.forEach((view) => {
    view.classList.toggle("is-visible", view.dataset.adminView === name);
  });

  adminLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.adminLink === name);
  });

  history.replaceState(null, "", `#${name}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

adminLinks.forEach((link) => {
  link.addEventListener("click", () => {
    showAdminView(link.dataset.adminLink);
  });
});

const initialAdminView = window.location.hash.replace("#", "") || "dashboard";
showAdminView(
  document.querySelector(`[data-admin-view="${initialAdminView}"]`)
    ? initialAdminView
    : "dashboard",
);
