// ==================================================
// Activity
// 活動記録を外部ファイルから読み込み、表示する
// ==================================================

const activityRecords = document.querySelector(".activity-records");

if (activityRecords) {

  fetch("../data/activity.txt")
    .then(response => {
      if (!response.ok) {
        throw new Error("活動記録ファイルを読み込めませんでした。");
      }

      return response.text();
    })

    .then(text => {

      const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "");

      let currentYear = null;
      let currentYearSection = null;
      let currentRecordList = null;

      lines.forEach(line => {

        // ------------------------------------------
        // 年
        // 例：2026
        // ------------------------------------------

        if (/^\d{4}$/.test(line)) {

          currentYear = line;

          currentYearSection = document.createElement("section");
          currentYearSection.className = "activity-year";

          const yearTitle = document.createElement("h2");
          yearTitle.textContent = `${currentYear}年`;

          currentRecordList = document.createElement("div");
          currentRecordList.className = "activity-record-list";

          currentYearSection.appendChild(yearTitle);
          currentYearSection.appendChild(currentRecordList);

          activityRecords.appendChild(currentYearSection);

          return;
        }


        // ------------------------------------------
        // 活動記録
        // 例：8/9 第67回広島県吹奏楽コンクール
        // ------------------------------------------

        if (currentYear) {

          const match = line.match(
            /^(\d{1,2})\/(\d{1,2})\s+(.+)$/
          );

          if (!match) {
            return;
          }

          const month = Number(match[1]);
          const day = Number(match[2]);
          const activityName = match[3];

          const recordItem = document.createElement("div");
          recordItem.className = "activity-record-item";

          const time = document.createElement("time");

          // datetime="2026-08-09" のような形式にする
          const monthText = String(month).padStart(2, "0");
          const dayText = String(day).padStart(2, "0");

          time.dateTime = `${currentYear}-${monthText}-${dayText}`;
          time.textContent = `${month}月${day}日`;

          const activity = document.createElement("span");
          activity.textContent = activityName;

          recordItem.appendChild(time);
          recordItem.appendChild(activity);

          currentRecordList.appendChild(recordItem);
        }

      });

    })

    .catch(error => {
      console.error(error);

      activityRecords.innerHTML = `
        <p>活動記録を読み込めませんでした。</p>
      `;
    });

}