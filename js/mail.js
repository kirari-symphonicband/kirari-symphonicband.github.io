// ==================================================
// MAIL
// メール申し込み用テンプレートを読み込む
// ==================================================

// ==================================================
// MAIL SETTINGS
// 今後変更する場合はここを編集
// ==================================================

const MAIL_TEMPLATE_PATH =
  "data/mailTemplate.txt";

const MAIL_ADDRESS =
  "kirari.symphonicband@gmail.com";


// ==================================================
// MAIL BUTTON
// ==================================================

const memberMailButton =
  document.querySelector("#member-mail-button");


// ==================================================
// LOAD MAIL TEMPLATE
// ==================================================

async function loadMailTemplate() {

  // メールボタンがないページでは何もしない
  if (!memberMailButton) {
    return;
  }

  try {

    const response =
      await fetch(MAIL_TEMPLATE_PATH);

    if (!response.ok) {

      throw new Error(
        `メールテンプレートを読み込めませんでした: ${response.status}`
      );

    }

    const text =
      await response.text();


    // ==================================================
    // コメント行を除外
    // 「#」から始まる行
    // ==================================================

    const templateText =
      text
        .split(/\r?\n/)
        .filter(line => !line.trim().startsWith("#"))
        .join("\n");


    // ==================================================
    // SUBJECT / BODY 分離
    // ==================================================

    const subjectMatch =
      templateText.match(
        /\[SUBJECT\]\s*([\s\S]*?)(?=\[BODY\]|$)/
      );

    const bodyMatch =
      templateText.match(
        /\[BODY\]\s*([\s\S]*)/
      );


    const subject =
      subjectMatch
        ? subjectMatch[1].trim()
        : "";

    const body =
      bodyMatch
        ? bodyMatch[1].trim()
        : "";


    // ==================================================
    // MAILTO 設定
    // ==================================================

    const mailto =
      `mailto:${MAIL_ADDRESS}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;


    memberMailButton.href =
      mailto;


  } catch (error) {

    console.error(
      "メールテンプレート読み込みエラー:",
      error
    );

  }

}

// ==================================================
// MAIL START
// ==================================================

loadMailTemplate();