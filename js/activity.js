// ==================================================
// Activity
// 活動記録を外部ファイルから読み込み、表示する
// ==================================================

console.log("activity.js 読み込み開始");

const activityRecords =
  document.querySelector(".activity-records");

if (!activityRecords) {

  console.error(
    ".activity-records が見つかりません。"
  );

} else {

  console.log(
    ".activity-records を取得しました。"
  );

  fetch("../data/activity.txt")
    .then(response => {

      console.log(
        "activity.txt response:",
        response.status
      );

      if (!response.ok) {

        throw new Error(
          `活動記録ファイルを読み込めませんでした: HTTP ${response.status}`
        );

      }

      return response.text();

    })

    .then(text => {

      console.log(
        "activity.txt 読み込み成功:",
        text
      );

      const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "");

      let currentYear = null;
      let currentRecordList = null;

      lines.forEach(line => {

        // ------------------------------------------
        // 年
        // 例：2026年
        // ------------------------------------------

        if (/^\d{4}年$/.test(line)) {

          currentYear =
            line.replace("年", "");

          const yearSection =
            document.createElement("section");

          yearSection.className =
            "activity-year";

          const yearTitle =
            document.createElement("h2");

          yearTitle.textContent =
            `${currentYear}年`;

          currentRecordList =
            document.createElement("div");

          currentRecordList.className =
            "activity-record-list";

          yearSection.appendChild(yearTitle);
          yearSection.appendChild(currentRecordList);

          activityRecords.appendChild(yearSection);

          return;
        }

        // ------------------------------------------
        // 活動記録
        // 例：8月9日 第67回広島県吹奏楽コンクール
        // ------------------------------------------

        if (currentYear) {

          const match = line.match(
            /^(\d{1,2})月(\d{1,2})日\s+(.+)$/
          );

          if (!match) {

            console.warn(
              "活動記録として認識できません:",
              line
            );

            return;

          }

          const month =
            Number(match[1]);

          const day =
            Number(match[2]);

          const activityName =
            match[3];

          const recordItem =
            document.createElement("div");

          recordItem.className =
            "activity-record-item";

          const time =
            document.createElement("time");

          const monthText =
            String(month).padStart(2, "0");

          const dayText =
            String(day).padStart(2, "0");

          time.dateTime =
            `${currentYear}-${monthText}-${dayText}`;

          time.textContent =
            `${month}月${day}日`;

          const activity =
            document.createElement("span");

          activity.textContent =
            activityName;

          recordItem.appendChild(time);
          recordItem.appendChild(activity);

          currentRecordList.appendChild(recordItem);

        }

      });

    })

    .catch(error => {

      console.error(
        "活動記録読み込みエラー:",
        error
      );

      activityRecords.innerHTML = `
        <p class="activity-error">
          活動記録を読み込めませんでした。<br>
          ${error.message}
        </p>
      `;

    });

}