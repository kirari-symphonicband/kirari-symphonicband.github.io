// ==================================================
// Mobile menu
// ==================================================

const menuButton = document.querySelector(".menu-button");
const globalNav = document.querySelector(".global-nav");

if (menuButton && globalNav) {

  menuButton.addEventListener("click", () => {

    const isOpen = globalNav.classList.toggle("is-open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  });

}


// ==================================================
// News
// /news/ 内のHTMLファイルを読み込んで表示
// ==================================================

const newsList = document.querySelector("#news-list");


// 新しい順にファイル名を記載
const newsFiles = [
  "2026-08-17.html",
  "2026-08-10.html",
  "2026-07-30.html"
];


async function loadNews() {

  if (!newsList) {
    return;
  }


  if (newsFiles.length === 0) {

    newsList.innerHTML = "";

    return;

  }


  try {

    const newsItems = await Promise.all(

      newsFiles.map(async (file) => {

        const response = await fetch(
          `news/${file}`
        );

        if (!response.ok) {

          throw new Error(
            `ニュースを読み込めませんでした: ${file}`
          );

        }

        const html = await response.text();

        return {
          file: file,
          html: html
        };

      })

    );


    newsList.innerHTML = newsItems
      .map(item => {

        const parser = new DOMParser();

        const document = parser.parseFromString(
          item.html,
          "text/html"
        );


        const article =
          document.querySelector(".news-data");


        if (!article) {
          return "";
        }


        const date =
          article.dataset.date || "";

        const category =
          article.dataset.category || "";

        const title =
          article.dataset.title || "";

        const url =
          article.dataset.url || `news/${item.file}`;


        return `

          <a href="${url}" class="news-item">

            <time datetime="${date.replace(/\./g, "-")}">
              ${date}
            </time>

            <span class="news-category">
              ${category}
            </span>

            <span class="news-title">
              ${title}
            </span>

            <span class="news-arrow">
              ›
            </span>

          </a>

        `;

      })
      .join("");


  } catch (error) {

    console.error(error);

    newsList.innerHTML = `
      <p class="news-error">
        お知らせを読み込めませんでした。
      </p>
    `;

  }

}


loadNews();


// ==================================================
// Slideshow
// ==================================================

const slideshow =
  document.querySelector("#slideshow");

const slideshowImage =
  document.querySelector("#slideshow-image");

const slideshowPlaceholder =
  document.querySelector("#slideshow-placeholder");

const slideshowPrev =
  document.querySelector(".slideshow-prev");

const slideshowNext =
  document.querySelector(".slideshow-next");

const slideshowDots =
  document.querySelector("#slideshow-dots");


// 使用する可能性のある画像
const slideshowImagePaths = [
  "images/slideshow/photo1.jpeg",
  "images/slideshow/photo2.jpeg",
  "images/slideshow/photo3.jpeg",
  "images/slideshow/photo4.jpeg",
  "images/slideshow/photo5.jpeg"
];


let slideshowImages = [];
let currentSlide = 0;
let slideshowTimer = null;


// ==================================================
// 画像の存在確認
// ==================================================

function checkImageExists(src) {

  return new Promise((resolve) => {

    const image = new Image();


    image.onload = () => {
      resolve(true);
    };


    image.onerror = () => {
      resolve(false);
    };


    image.src = src;

  });

}


// ==================================================
// スライドショー初期化
// ==================================================

async function initializeSlideshow() {

  if (
    !slideshow ||
    !slideshowImage ||
    !slideshowPlaceholder
  ) {
    return;
  }


  // 存在する画像だけを残す
  const results = await Promise.all(

    slideshowImagePaths.map(async (src) => {

      const exists =
        await checkImageExists(src);

      return {
        src: src,
        exists: exists
      };

    })

  );


  slideshowImages = results
    .filter(item => item.exists)
    .map(item => item.src);


  // 写真が1枚もない場合
  if (slideshowImages.length === 0) {

    slideshowImage.style.display = "none";

    slideshowPlaceholder.style.display = "flex";

    if (slideshowPrev) {
      slideshowPrev.disabled = true;
    }

    if (slideshowNext) {
      slideshowNext.disabled = true;
    }

    if (slideshowDots) {
      slideshowDots.innerHTML = "";
    }

    return;

  }


  // 写真がある場合
  slideshowPlaceholder.style.display = "none";

  slideshowImage.style.display = "block";


  createSlideshowDots();

  showSlide(0);


  // 写真が2枚以上ある場合のみ
  // 自動スライドと左右ボタンを有効化
  if (slideshowImages.length > 1) {

    startSlideshowTimer();

  } else {

    if (slideshowPrev) {
      slideshowPrev.disabled = true;
    }

    if (slideshowNext) {
      slideshowNext.disabled = true;
    }

  }

}


// ==================================================
// スライド表示
// ==================================================

function showSlide(index) {

  if (
    !slideshowImage ||
    slideshowImages.length === 0
  ) {
    return;
  }


  if (index >= slideshowImages.length) {

    currentSlide = 0;

  } else if (index < 0) {

    currentSlide =
      slideshowImages.length - 1;

  } else {

    currentSlide = index;

  }


  slideshowImage.src =
    slideshowImages[currentSlide];


  updateSlideshowDots();

}


// ==================================================
// ドット生成
// ==================================================

function createSlideshowDots() {

  if (!slideshowDots) {
    return;
  }


  slideshowDots.innerHTML = "";


  slideshowImages.forEach((src, index) => {

    const dot =
      document.createElement("button");


    dot.type = "button";

    dot.className = "slideshow-dot";

    dot.dataset.slide = String(index);

    dot.setAttribute(
      "aria-label",
      `${index + 1}枚目`
    );


    dot.addEventListener(
      "click",
      () => {

        showSlide(index);

        resetSlideshowTimer();

      }
    );


    slideshowDots.appendChild(dot);

  });


  updateSlideshowDots();

}


// ==================================================
// ドット状態更新
// ==================================================

function updateSlideshowDots() {

  if (!slideshowDots) {
    return;
  }


  const dots =
    slideshowDots.querySelectorAll(
      ".slideshow-dot"
    );


  dots.forEach((dot, index) => {

    dot.classList.toggle(
      "is-active",
      index === currentSlide
    );

  });

}


// ==================================================
// 前の写真
// ==================================================

if (slideshowPrev) {

  slideshowPrev.addEventListener(
    "click",
    () => {

      if (slideshowImages.length <= 1) {
        return;
      }

      showSlide(currentSlide - 1);

      resetSlideshowTimer();

    }
  );

}


// ==================================================
// 次の写真
// ==================================================

if (slideshowNext) {

  slideshowNext.addEventListener(
    "click",
    () => {

      if (slideshowImages.length <= 1) {
        return;
      }

      showSlide(currentSlide + 1);

      resetSlideshowTimer();

    }
  );

}


// ==================================================
// 自動スライド開始
// ==================================================

function startSlideshowTimer() {

  clearInterval(slideshowTimer);


  slideshowTimer = setInterval(() => {

    if (slideshowImages.length > 1) {

      showSlide(currentSlide + 1);

    }

  }, 5000);

}


// ==================================================
// 自動スライドリセット
// ==================================================

function resetSlideshowTimer() {

  if (slideshowImages.length <= 1) {
    return;
  }


  startSlideshowTimer();

}


// ==================================================
// スライドショー実行
// ==================================================

initializeSlideshow();