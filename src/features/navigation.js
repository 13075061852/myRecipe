import { allNavLinks, allSections } from "../core/dom.js";

export function activateSection(sectionId) {
    const targetLink = document.querySelector(`.nav-link[data-target="${sectionId}"]`);
    targetLink?.click();
}

export function setupNavigation() {
    allNavLinks().forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = link.dataset.target;

            allNavLinks().forEach((node) => node.classList.remove("active"));
            allSections().forEach((section) => section.classList.remove("active"));

            link.classList.add("active");
            document.getElementById(targetId)?.classList.add("active");
        });
    });
}
