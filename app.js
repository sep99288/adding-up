'use strict';
const fs = require('fs');   //FileSystem ファイルを扱うモジュール
const readline = require('readline');   //ファイルを一行ずつ読み込むモジュール
const rs = fs.createReadStream('./popu-pref.csv');  //ファイルとして読み込める状態に準備する
const rl = readline.createInterface({ input: rs, outoput: {} });    //readlineモジュールに rs を設定する
const prefectureDataMap = new Map();    // key: 都道府県 value: 集計データのオブジェクト

// function lineOut(lineString) {   //これでも動く アロー関数を使わない場合
//     console.log(lineString);
// }
// rl.on('line', lineOut);

//非同期処理　イベント駆動型　Stream処理
// popu-pref.csv のデータを一行ずつ読み込んで設定された関数を実行する
rl.on('line', lineString => {   //linestring に 読み込んだ文字列を一行ずつ入れて 関数の中の処理をする
    const colums = lineString.split(',');   //データを配列に分割
    const year = parseInt(colums[0]);   //perseInt 文字列を数値型に変換
    const prefecture = colums[1];
    const popu = parseInt(colums[3]);
    if (year === 2010 || year === 2015) {
        // console.log(year + " " + prefecture + " " + popu);

        // 都道府県ごとのデータを作る
        let value = prefectureDataMap.get(prefecture);
        // データが無かったら(Falsyだったら)データを初期化
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
        // console.log(lineString);
});

//   '北海道' => { popu10: 258530, popu15: 236840, change: null },
//   '北海道' => { popu10: 258530, popu15: 236840, change: 0.9161025799713767 },

rl.on('close', () => {
    //  全データをループして変化率を計算
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    // Array.from(prefectureDataMap) 連想配列を普通の配列に変換する
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        //change 同士を引き算して負か正か0か判別して降順、昇順に並び変える
        return pair2[1].change - pair1[1].change;
        // console.log(pair1[0] + "と" + pair2[0] + "を比較");
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (key + ': ' + value.popu10 + '人 => ' + value.popu15 + '人 変化率:' + value.change);
    });
    console.log(rankingStrings);
});

//    [ '北海道',{ popu10: 258530, popu15: 236840, change: 0.9161025799713767 } ]