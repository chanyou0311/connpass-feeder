# connpass-feeder
connpassの新着情報をSlackに教えてくれるGoogle Apps Script


## 使い方

### スプレッドシートを複製する方法

https://docs.google.com/spreadsheets/d/1-Xw6BvY5esszcjQbdl6-Z5I9I6ufxwD_xBWOMUl9aws/edit?usp=sharing

上記のスプレッドシートの「ファイル>コピーを作成」からスプレッドシートを複製する。

複製されたスプレッドシートの config シートに Slack Webhook URL と 検索キーワードを入力しておく。

「ツール>スクリプトエディタ」からスクリプトを表示し、メニューの時計マークからトリガー一覧画面に遷移する。
下記の設定でトリガーを追加する。

| 項目                               | 値                   |
| ---------------------------------- | -------------------- |
| 実行する関数を選択                 | main                 |
| 実行するデプロイを選択             | Head                 |
| イベントのソースを選択             | 時間主導型           |
| 時間ベースのトリガーのタイプを選択 | 時間ベースのタイマー |
| 時間の間隔を選択（時間）           | 6時間おき            |
| エラー通知設定                     | 毎日通知を受け取る   |

時間やエラー通知設定はお好みで調整してください。

以上で設定は完了です。

### クローンする方法

空のスプレッドシートを作成して、下記のスプレッドシートと同様のシートとカラムになるように整える。

https://docs.google.com/spreadsheets/d/1-Xw6BvY5esszcjQbdl6-Z5I9I6ufxwD_xBWOMUl9aws/edit?usp=sharing


コードをクローンする。

```
$ git clone https://github.com/chanyou0311/connpass-feeder.git
```

ルートディレクトリに `.clasp.json` を下記の内容で作成する。

```json
{
  "scriptId": "<YOUR_SCRIPT_ID>",
  "rootDir": "./src"
}
```

npmパッケージをインストール後、 `clasp push` コマンドでGASにコードをプッシュする。

```
$ yarn
$ yarn run clasp push
```

後はスプレッドシート複製の方法と同様の手順でスプレッドシートのconfigシートの値とトリガーを設定したら設定完了です。
