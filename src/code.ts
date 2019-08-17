interface payloadInterface {
  text: string;
}

const slackWebhookUrl: string = PropertiesService.getScriptProperties().getProperty(
  "slackWebhookUrl"
);

function notifySlack(message: string) {
  const payloadData: payloadInterface = {
    text: message
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payloadData)
  };
  UrlFetchApp.fetch(slackWebhookUrl, options);
}

function main() {
  notifySlack("hey!");
}
