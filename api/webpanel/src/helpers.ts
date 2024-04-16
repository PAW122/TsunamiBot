export function navbarStyle() {
    let el = document.querySelector(".navbar.sticky-top");
    let observer = new IntersectionObserver(
        ([e]) => e.target.classList.toggle("is-pinned", e.intersectionRatio < 1),
        { threshold: [1] }
    );
    if (el) {
        console.debug("applied navbar observer");
        observer.observe(el);
    }
}