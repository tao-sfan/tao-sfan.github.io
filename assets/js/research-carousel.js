(function () {
  "use strict";

  function initResearchCarousel(carousel) {
    var viewport = carousel.querySelector("[data-carousel-viewport]");
    var track = carousel.querySelector("[data-carousel-track]");
    var cards = Array.prototype.slice.call(track.children);
    var previousButton = carousel.querySelector("[data-carousel-prev]");
    var nextButton = carousel.querySelector("[data-carousel-next]");
    var pagination = carousel.querySelector("[data-carousel-pagination]");
    var status = carousel.querySelector("[data-carousel-status]");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var dots = [];
    var currentIndex = 0;
    var visibleCount = 1;
    var maximumIndex = 0;
    var scrollFrame;

    function cardWidth() {
      return cards[0].getBoundingClientRect().width;
    }

    function calculateVisibleCount() {
      var width = cardWidth();

      if (!width) {
        return 1;
      }

      return Math.min(cards.length, Math.max(1, Math.round(viewport.clientWidth / width)));
    }

    function positionLabel(index) {
      var first = index + 1;
      var last = Math.min(cards.length, index + visibleCount);

      return "Show research areas " + first + " to " + last + " of " + cards.length;
    }

    function updateControls() {
      var lastVisible = Math.min(cards.length, currentIndex + visibleCount);

      previousButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === maximumIndex;
      status.textContent = "Showing research areas " + (currentIndex + 1) + " to " + lastVisible + " of " + cards.length;

      dots.forEach(function (dot, index) {
        if (index === currentIndex) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function goTo(index, animate) {
      currentIndex = Math.max(0, Math.min(index, maximumIndex));
      viewport.scrollTo({
        left: currentIndex * cardWidth(),
        behavior: animate && !reducedMotion.matches ? "smooth" : "auto"
      });
      updateControls();
    }

    function buildPagination() {
      pagination.textContent = "";
      dots = [];

      for (var index = 0; index <= maximumIndex; index += 1) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "research-carousel__dot";
        dot.setAttribute("aria-label", positionLabel(index));
        dot.addEventListener("click", (function (targetIndex) {
          return function () {
            goTo(targetIndex, true);
          };
        }(index)));
        pagination.appendChild(dot);
        dots.push(dot);
      }
    }

    function refreshLayout() {
      var nextVisibleCount = calculateVisibleCount();
      var nextMaximumIndex = Math.max(0, cards.length - nextVisibleCount);

      carousel.classList.toggle("is-scrollable", nextMaximumIndex > 0);

      if (nextVisibleCount !== visibleCount || nextMaximumIndex !== maximumIndex) {
        visibleCount = nextVisibleCount;
        maximumIndex = nextMaximumIndex;
        currentIndex = Math.min(currentIndex, maximumIndex);
        buildPagination();
      }

      goTo(currentIndex, false);
    }

    function updateFromScroll() {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(function () {
        var width = cardWidth();

        if (width) {
          currentIndex = Math.max(0, Math.min(Math.round(viewport.scrollLeft / width), maximumIndex));
          updateControls();
        }
      });
    }

    previousButton.addEventListener("click", function () {
      goTo(currentIndex - 1, true);
    });

    nextButton.addEventListener("click", function () {
      goTo(currentIndex + 1, true);
    });

    viewport.addEventListener("scroll", updateFromScroll, { passive: true });
    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(currentIndex - 1, true);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(currentIndex + 1, true);
      }
    });

    carousel.classList.add("is-enhanced");
    refreshLayout();

    if ("ResizeObserver" in window) {
      new ResizeObserver(refreshLayout).observe(viewport);
    } else {
      window.addEventListener("resize", refreshLayout);
    }
  }

  function initialize() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-research-carousel]"), initResearchCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
}());
