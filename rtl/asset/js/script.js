import { validate, sort, $, clearStatus, formatDate } from "./functions.js";

const slider = $("section.slider", (els) => {
    return Array.isArray(els) ? els[0] : els;
  }),
  inner = $(".slider-inner", (els) => {
    return Array.isArray(els) ? els[0] : els;
  }),
  slides = [],
  navs = [],
  next = document.createElement("nav"),
  prev = document.createElement("nav"),
  timeD = 500;

let ActiveIndex = 0,
  imagesInfo = [];

next.classList.add("slider-arrow", "arrow-next");
prev.classList.add("slider-arrow", "arrow-prev");
next.setAttribute("role","button")
prev.setAttribute("role","button")

fetch("./images.php")
  .then((req) => req.json())
  .then((imgs) => {
    let images = validate(imgs);
    images = sort(images);

    // images.reverse();

    const navbar = document.createElement("section");

    slider.appendChild(next);
    slider.appendChild(prev);

    navbar.classList.add("slider-navbar");
    slider.appendChild(navbar);

    images.forEach((image, i) => {
      imagesInfo.push(image);

      const slide = document.createElement("div"),
        nav = document.createElement("nav"),
        time = new Date(image.time.start);

      slides.push(slide);
      navs.push(nav);

      nav.setAttribute("role", "navigation")

      slide.style.backgroundImage = `url(${image.url})`;
      slide.innerHTML += `
        <span class="slider-slide-date">
          ${formatDate(time)}
          
        </span>
      `;

      if (image.live) {
        slide.innerHTML += `
          <span class="slider-slide-live"></span>
        `;
      }

      const inter = setInterval(() => {
        if (!image.live) {
          const now = Date.now();
          image.live = image.time.start <= now && image.time.expire >= now;

          if (image.live) {
            slide.innerHTML += `
            <span class="slider-slide-live"></span>
          `;

            if (!slider.classList.contains("fullscreen")) {
              showSlide(i);
            }

            clearInterval(inter);
          } else if (slide.querySelector("span.slider-slide-live")) {
            slide.removeChild(slide.querySelector("span.slider-slide-live"));
          }
        } else {
          clearInterval(inter);
        }
      }, 1000);

      nav.setAttribute("show", navs.length);

      slide.classList.add("slider-item");
      nav.classList.add("slider-nav");

      inner.appendChild(slide);
      navbar.appendChild(nav);
    });

    if (haveLive(images)) {
      showSlide(haveLive(images, true));
    } else {
      if (slides.length % 2 != 0) {
        showSlide((slides.length + 1) / 2 - 1);
      } else {
      }
    }
    next.addEventListener("click", () => {
      if (slides[ActiveIndex + 1]) {
        showSlide(ActiveIndex + 1);
      }
    });

    prev.addEventListener("click", () => {
      if (slides[ActiveIndex - 1]) {
        showSlide(ActiveIndex - 1);
      }
    });

    navs.forEach((nav) => {
      nav.addEventListener("click", () => {
        clickNavs(nav);
      });
    });

    function clickNavs(nav) {
      showSlide(nav.getAttribute("show") - 1);
    }

    addEventListener("resize", () => {
      navs[ActiveIndex].click();
    });

    slides.forEach((slide, i) => {
      slide.addEventListener("click", () => {
        if (i == ActiveIndex) {
          if (slider.classList.contains("fullscreen")) {
            slider.classList.remove("fullscreen");
            outFullscreen(slider);

            setTimeout(() => {
              $(".slider-inner").scrollTo({
                top: 0,
                left:
                  slides[ActiveIndex].offsetLeft -
                  (innerWidth - slides[ActiveIndex].clientWidth) / 2,
                behavior: "smooth",
              });
            }, timeD);
          } else {
            slider.classList.add("fullscreen");
            inFullscreen(slider);

            setTimeout(() => {
              $(".slider-inner").scrollTo({
                top: 0,
                left:
                  slides[ActiveIndex].offsetLeft -
                  (innerWidth - slides[ActiveIndex].clientWidth) / 2,
                behavior: "smooth",
              });
            }, timeD);

            addEventListener("keyup", ({ key }) => {
              if (key == "Escape") slides[ActiveIndex].click();
            });
          }
        } else if (
          i != ActiveIndex &&
          !slider.classList.contains("fullscreen")
        ) {
          showSlide(i);
        }
      });
    });
  });

addEventListener("keyup", (e) => {
  switch (e.key.toLowerCase()) {
    case "arrowright":
      e.preventDefault();
      prev.click();
      break;

    case "arrowleft":
      e.preventDefault();
      next.click();
      break;

    default:
      break;
  }
});

function showSlide(index) {
  clearStatus(".slider-item,.slider-nav");

  ActiveIndex = +index;

  setTimeout(() => {
    $(".slider-inner").scrollTo({
      top: 0,
      left:
        slides[ActiveIndex].offsetLeft -
        (innerWidth - slides[ActiveIndex].clientWidth) / 2,
      behavior: "smooth",
    });
  }, timeD);

  slides[ActiveIndex].classList.add("active");
  navs[ActiveIndex].classList.add("active");

  if (slides[ActiveIndex + 1]) {
    slides[ActiveIndex + 1].classList.add("next");
    next.classList.remove("disabled");
  } else {
    next.classList.add("disabled");
  }

  if (slides[ActiveIndex - 1]) {
    slides[ActiveIndex - 1].classList.add("next");
    prev.classList.remove("disabled");
  } else {
    prev.classList.add("disabled");
  }

  if (slider.classList.contains("fullscreen")) {
    const downloadBtn = $(".btn.download-btn"),
      time = new Date(imagesInfo[ActiveIndex].time.start);

    downloadBtn.download =
      [time.getFullYear(), time.getMonth() + 1, time.getDate()].join("-") +
      "_" +
      [time.getHours(), time.getMinutes()].join("-");

    downloadBtn.href = imagesInfo[ActiveIndex].url;

    $(".btn.open-btn").href = imagesInfo[ActiveIndex].url;
  }
}

function haveLive(array, index = false , last = false) {
  let result = false;

  array.forEach((item, i) => {
    if (item.live && (result === false || last)) {
      if (index && (result === false || last)) result = i;
      else result = true;
    }
  });

  return result;
}

function inFullscreen(parent) {
  //change default settings
  $("html").classList.add("fullscreen-body");

  //create header for btns
  const navbar = document.createElement("section");
  navbar.classList.add("slider-btn-navbar");
  parent.appendChild(navbar);

  //close
  const closeBtn = document.createElement("span");
  closeBtn.setAttribute("role", "button");
  closeBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path class="svg-color" d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z" />
  </svg>
  `;
  closeBtn.classList.add("btn", "btn-fill-color", "close-btn");
  navbar.appendChild(closeBtn);

  //download
  const downloadBtn = document.createElement("a"),
    time = new Date(imagesInfo[ActiveIndex].time.start);

  downloadBtn.setAttribute("role", "button");

  downloadBtn.download =
    [time.getFullYear(), time.getMonth() + 1, time.getDate()].join("-") +
    "_" +
    [time.getHours(), time.getMinutes()].join("-");

  downloadBtn.href = imagesInfo[ActiveIndex].url;
  downloadBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" class="svg-color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4">
    </path>
    <polyline points="7 10 12 15 17 10">
    </polyline>
    <line x1="12" y1="15" x2="12" y2="3">
    </line>
  </svg>
  `;
  downloadBtn.classList.add("btn", "download-btn", "btn-stroke-color");
  navbar.appendChild(downloadBtn);

  //info
  const infoBtn = document.createElement("span");
  infoBtn.setAttribute("role", "button");
  infoBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" class="svg-color" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info">
    <circle cx="12" cy="12" r="10">
    </circle>
    <line x1="12" y1="16" x2="12" y2="12">
    </line>
    <line x1="12" y1="8" x2="12.01" y2="8">
    </line>
  </svg>
  `;
  infoBtn.classList.add("btn", "info-btn", "btn-stroke-color");
  navbar.appendChild(infoBtn);

  //open image in new tab
  const openBtn = document.createElement("a");
  openBtn.setAttribute("role", "button");
  openBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path class="svg-color" fill="none" d="M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z" />
  </svg>

  `;
  openBtn.classList.add("btn", "open-btn", "btn-fill-color");
  openBtn.href = imagesInfo[ActiveIndex].url;
  openBtn.target = "_blank";
  navbar.appendChild(openBtn);

  //events
  closeBtn.addEventListener("click", () => {
    slides[ActiveIndex].click();
  });

  infoBtn.addEventListener("click", () => {
    //make alert
    const alert = document.createElement("section"),
      ul = document.createElement("ul");

    alert.classList.add("alert");

    ul.innerHTML = `
      <li>شروع رویداد:
       <span>
        ${formatDate(new Date(imagesInfo[ActiveIndex].time.start))
          .split(" ")
          .reverse()
          .join(" ")}
        </span>
      </li>

      <li>پایان رویداد: 
        <span>
          ${formatDate(new Date(imagesInfo[ActiveIndex].time.expire))
            .split(" ")
            .reverse()
            .join(" ")}
        </span>
      </li>

      ${
        imagesInfo[ActiveIndex].live
          ? `
          <li class="live">
            در حال برگذاری
          </li>
        `
          : ""
      }
    `;

    alert.appendChild(ul);
    parent.classList.add("filter");
    document.body.appendChild(alert);

    //close
    setTimeout(() => {
      onclick = () => {
        alert.classList.add("alert-close");
        setTimeout(() => {
          parent.classList.remove("filter");
          document.body.removeChild(alert);
        }, 500);

        onclick = null;
      };

      alert.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }, 500);
  });
}

function outFullscreen(parent) {
  parent.removeChild($("section.slider-btn-navbar"));
  $("html").classList.remove("fullscreen-body");
}

setInterval(() => {
  if (!slider.classList.contains("fullscreen"))
    if (ActiveIndex + 1 === slides.length) {
      showSlide(0);
    } else {
      prev.click();
    }
}, 10000);