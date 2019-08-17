interface series {
  url: string;
  id: number;
  title: string;
}

interface event {
  event_url: string;
  event_type: string;
  owner_nickname: string;
  series: series;
  updated_at: string;
  lat: string;
  started_at: string;
  hash_tag: string;
  title: string;
  event_id: number;
  lon: string;
  waiting: number;
  limit: number;
  owner_id: number;
  owner_display_name: string;
  description: string;
  address: string;
  catch: string;
  accepted: number;
  ended_at: string;
  place: string;
}

interface attachmentField {
  title: string;
  value: string;
  short: boolean;
}

interface attachment {
  fallback: string;
  color: string;
  pretext?: string;
  author_name: string;
  author_link: string;
  author_icon: string;
  title: string;
  title_link: string;
  text: string;
  fields: Array<attachmentField>;
  image_url: string;
  thumb_url: string;
  footer: string;
  footer_icon: string;
  ts: number;
}

interface payloadInterface {
  text: string;
  attachments: Array<attachment>;
}

const slackWebhookUrl: string = PropertiesService.getScriptProperties().getProperty(
  "slackWebhookUrl"
);

function notifySlack(message: string, event: event) {
  const attachment: attachment = {
    fallback: "Required plain-text summary of the attachment.",
    color: "#D33017",
    // pretext: "新しいイベントを発見したよ。",
    author_name: "Connpass",
    author_link: "https://connpass.com",
    author_icon: "https://connpass.com/static/img/api/connpass_logo_4.png",
    title: event.title,
    title_link: event.event_url,
    text: event.catch,
    fields: [
      {
        title: "イベント開催日時",
        value: `開始: ${event.started_at}\n終了: ${event.ended_at}`,
        short: false
      },
      {
        title: "場所",
        value: `${event.address}\n${event.place}`,
        short: false
      }
    ],
    image_url: "http://my-website.com/path/to/image.jpg",
    thumb_url: "http://example.com/path/to/thumb.png",
    footer: "ふもちゃん",
    footer_icon:
      "https://avatars.slack-edge.com/2019-08-16/729497104224_c495afa8a121b77eb718_512.jpg",
    ts: Math.round(Date.parse(event.updated_at) / 1000)
  };
  const payloadData: payloadInterface = {
    text: message,
    attachments: [attachment]
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payloadData)
  };
  UrlFetchApp.fetch(slackWebhookUrl, options);
}

function getConnpassEvents(url: string): Array<event> {
  const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
    url + "?keyword=広島&count=100"
  );
  const responseData: object = JSON.parse(response.getContentText());
  return responseData["events"];
}

function getHeaders(sheet: GoogleAppsScript.Spreadsheet.Sheet): Array<string> {
  const headerRange: GoogleAppsScript.Spreadsheet.Range = sheet.getRange(
    1,
    1,
    1,
    sheet.getLastColumn()
  );
  return headerRange.getValues()[0];
}

function getEventIds(sheet: GoogleAppsScript.Spreadsheet.Sheet): Array<number> {
  if (sheet.getLastRow() < 2) return [];

  const range: GoogleAppsScript.Spreadsheet.Range = sheet.getRange(
    2,
    1,
    sheet.getLastRow() - 1
  );
  const flatten = array => {
    return array.reduce((a, c) => {
      return Array.isArray(c) ? a.concat(flatten(c)) : a.concat(c);
    }, []);
  };
  return flatten(range.getValues());
}

function updateSpreadsheet(events: Array<event>) {
  const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet: GoogleAppsScript.Spreadsheet.Sheet = spreadsheet.getActiveSheet();

  const lastRow: number = sheet.getDataRange().getLastRow();
  const lastColumn: number = sheet.getDataRange().getLastColumn();

  const headers: Array<string> = getHeaders(sheet);
  const event_ids: Array<number> = getEventIds(sheet);

  let header: string;
  events.map(event => {
    if (event_ids.indexOf(event.event_id) === -1) {
      const row: number = sheet.getDataRange().getLastRow() + 1;
      for (header of Object.keys(event)) {
        const column: number = headers.indexOf(header) + 1;
        sheet.getRange(row, column).setValue(event[header]);
      }
      notifySlack("新しいイベントを発見したよ！", event);
    } else {
      const row: number = event_ids.indexOf(event.event_id) + 2;
      const range: GoogleAppsScript.Spreadsheet.Range = sheet.getRange(
        row,
        1,
        1,
        sheet.getLastColumn()
      );
      const sheetUpdatedAt = range.getValues()[0][1];
      if (sheetUpdatedAt !== event.updated_at) {
        for (header of Object.keys(event)) {
          const column: number = headers.indexOf(header) + 1;
          sheet.getRange(row, column).setValue(event[header]);
        }
        notifySlack("イベントが更新されたみたいだよ！", event);
      }
    }
  });
}

function main() {
  const events = getConnpassEvents("https://connpass.com/api/v1/event/");
  updateSpreadsheet(events);
}
