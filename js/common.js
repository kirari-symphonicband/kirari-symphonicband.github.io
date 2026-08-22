// ==================================================
// Kirariシンフォニックバンドひろしま
// Common JavaScript
// ==================================================

// ==================================================
// SETTINGS
// ==================================================

// ------------------------------
// NEWS
// ------------------------------

// トップページに表示するNEWSファイル
// 新しいニュースを追加したら、ここに追加してください。
// 上から新しい順に記載します。

const TOP_NEWS_FILES = [
  "2026-08-20.html"
];


// ------------------------------
// SLIDESHOW
// ------------------------------

// スライドショーで使用する画像
// 新しい画像を追加・変更する場合はここだけ編集してください。

const SLIDESHOW_IMAGE_PATHS = [
  "images/slideshow/photo1.jpeg",
  "images/slideshow/photo2.jpeg",
  "images/slideshow/photo3.jpeg",
  "images/slideshow/photo4.jpeg",
  "images/slideshow/photo5.jpeg"
];

// 自動スライドの切り替え時間（ミリ秒）
// 5000 = 5秒

const SLIDESHOW_INTERVAL = 5000;


// ==================================================
// Mobile menu
// ==================================================

const menuButton =
  document.querySelector(".menu-button");

const globalNav =
  document.querySelector(".global-nav");


if (menuButton && globalNav) {

  menuButton.addEventListener("click", () => {

    const isOpen =
      globalNav.classList.toggle("is-open");


    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  });

}


// ==================================================
// News
// トップページのNEWSを読み込んで表示
// ==================================================

const newsList =
  document.querySelector("#news-list");


async function loadNews() {

  // トップページ以外では何もしない
  if (!newsList) {
    return;
  }


  // NEWSが0件の場合
  if (TOP_NEWS_FILES.length === 0) {

    newsList.innerHTML = "";

    return;

  }


  try {

    const newsItems =
      await Promise.all(

        TOP_NEWS_FILES.map(async (file) => {

          // トップページから
          // /news/ 内のHTMLを読み込む
          const response =
            await fetch(`news/${file}`);


          if (!response.ok) {

            throw new Error(
              `ニュースを読み込めませんでした: ${file}`
            );

          }


          const html =
            await response.text();


          return {
            file: file,
            html: html
          };

        })

      );


    newsList.innerHTML =

      newsItems

        .map(item => {

          const parser =
            new DOMParser();


          const document =
            parser.parseFromString(
              item.html,
              "text/html"
            );


          const article =
            document.querySelector(
              ".news-data"
            );


          if (!article) {

            console.error(
              `${item.file} に .news-data がありません。`
            );

            return "";

          }


          const date =
            article.dataset.date || "";

          const category =
            article.dataset.category || "";

          const title =
            article.dataset.title || "";


          // トップページからNEWSページへ
          const url =
            `news/${item.file}`;


          return `

            <a
              href="${url}"
              class="news-item"
            >

              <time
                datetime="${date.replace(/\./g, "-")}"
              >
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

    console.error(
      "NEWS読み込みエラー:",
      error
    );


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


// スライドショーで実際に存在する画像
let slideshowImages = [];

let currentSlide = 0;

let slideshowTimer = null;


// ==================================================
// 画像の存在確認
// ==================================================

function checkImageExists(src) {

  return new Promise((resolve) => {

    const image =
      new Image();


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
  const results =
    await Promise.all(

      SLIDESHOW_IMAGE_PATHS.map(
        async (src) => {

          const exists =
            await checkImageExists(src);


          return {
            src: src,
            exists: exists
          };

        }
      )

    );


  slideshowImages =
    results

      .filter(
        item => item.exists
      )

      .map(
        item => item.src
      );


  // 写真が1枚もない場合
  if (slideshowImages.length === 0) {

    slideshowImage.style.display =
      "none";


    slideshowPlaceholder.style.display =
      "flex";


    if (slideshowPrev) {

      slideshowPrev.disabled =
        true;

    }


    if (slideshowNext) {

      slideshowNext.disabled =
        true;

    }


    return;

  }


  // 写真がある場合
  slideshowPlaceholder.style.display =
    "none";


  slideshowImage.style.display =
    "block";


  // 最初の写真
  slideshowImage.src =
    slideshowImages[0];


  slideshowImage.classList.remove(
    "is-changing"
  );


  // 写真が2枚以上ある場合
  if (slideshowImages.length > 1) {

    if (slideshowPrev) {

      slideshowPrev.disabled =
        false;

    }


    if (slideshowNext) {

      slideshowNext.disabled =
        false;

    }


    startSlideshowTimer();

  } else {

    if (slideshowPrev) {

      slideshowPrev.disabled =
        true;

    }


    if (slideshowNext) {

      slideshowNext.disabled =
        true;

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


  // フェードアウト
  slideshowImage.classList.add(
    "is-changing"
  );


  // 写真変更
  setTimeout(() => {

    slideshowImage.src =
      slideshowImages[currentSlide];


    // 新しい画像読み込み後に表示
    slideshowImage.onload = () => {

      slideshowImage.classList.remove(
        "is-changing"
      );

    };

  }, 300);

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


      showSlide(
        currentSlide - 1
      );


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


      showSlide(
        currentSlide + 1
      );


      resetSlideshowTimer();

    }
  );

}


// ==================================================
// 自動スライド開始
// ==================================================

function startSlideshowTimer() {

  clearInterval(
    slideshowTimer
  );


  slideshowTimer =
    setInterval(() => {

      if (
        slideshowImages.length > 1
      ) {

        showSlide(
          currentSlide + 1
        );

      }

    }, SLIDESHOW_INTERVAL);

}


// ==================================================
// 自動スライドリセット
// ==================================================

function resetSlideshowTimer() {

  if (
    slideshowImages.length <= 1
  ) {

    return;

  }


  startSlideshowTimer();

}


// ==================================================
// スライドショー実行
// ==================================================

initializeSlideshow();


// ==================================================
// Instagram
// 画像が存在しない場合、投稿枠を非表示
// ==================================================

document
  .querySelectorAll(
    ".instagram-item img"
  )
  .forEach((img) => {

    img.addEventListener(
      "error",
      () => {

        const item =
          img.closest(
            ".instagram-item"
          );


        if (item) {

          item.remove();

        }

      }
    );

  });