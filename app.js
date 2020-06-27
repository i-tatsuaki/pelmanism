/* 配布カード */
const kindOfCards = []; // 種類

/* カードステータス */
const statusClose = "0";
const statusOpen = "1";
const statusFinished = "2";

/* カード画像 */
const cardKinds = new Map(); // カード種類id -> 画像ソース
cardKinds.set("1", "https://source.unsplash.com/Y8lCoTRgHPE");
cardKinds.set("2", "https://source.unsplash.com/pmfJcN7RGiw");
cardKinds.set("3", "https://source.unsplash.com/8FG9tt8qZ-8");
cardKinds.set("4", "https://source.unsplash.com/gJtDg6WfMlQ");
cardKinds.set("5", "https://source.unsplash.com/diO0a_ZEiEE");
cardKinds.set("6", "https://source.unsplash.com/DG-BBGw7d6E");
cardKinds.set("7", "https://source.unsplash.com/XvIilfGPenE");
cardKinds.set("8", "https://source.unsplash.com/ucSTXehEyJI");
cardKinds.set("9", "https://source.unsplash.com/6W4F62sN_yI");
cardKinds.set("10", "https://source.unsplash.com/2PODhmrvLik");
cardKinds.set("11", "https://source.unsplash.com/NK-N6coeI5Y");
cardKinds.set("12", "https://source.unsplash.com/uGP_6CAD-14");
cardKinds.set("13", "https://source.unsplash.com/GIsFHopvbPA");
cardKinds.set("14", "https://source.unsplash.com/HeEJU3nrg_0");
cardKinds.set("15", "https://source.unsplash.com/sEApBUS4fIk");
cardKinds.set("16", "https://source.unsplash.com/TvzRUkSlCy4");
cardKinds.set("17", "https://source.unsplash.com/_wpce-AsLxk");
cardKinds.set("18", "https://source.unsplash.com/q82BAzAWGTQ");
cardKinds.set("19", "https://source.unsplash.com/HH4WBGNyltc");
cardKinds.set("20", "https://source.unsplash.com/ZdnGBXc9DF8");
const closeCardImage = "images/card-behind.png";

/* プレイ人数 */
let numberOfPlayer = 4;

/* ターン制御 */
let playing = 4; // 誰のターンか
let openFirstCardNumber = 0; // 1枚目に開いたカードの番号（１枚目を開くときは0が入っている）
let countTotalOpenCard = 0;
let gameFinished = false;

/* 同時操作制御 */
let isProcessing = false;

/* DOM */
const cards = document.querySelectorAll("[class*='card--']");
const players = document.querySelectorAll("[class*='player--']");
const settingButton = document.querySelectorAll(".apply-button")[0];

/* 拡大画像表示ポップアップ */
const showBigImageArea = document.getElementById('showBigImageArea');

/* 画面初期イベント設定 */
settingButton.addEventListener("click", function () {setting();saveSetting();});


/* ゲーム開始処理 */
const app = () => {
    startup();

    /* event */
    cards.forEach(card => {
        card.addEventListener("click", function(){clickCard(card)});
    });
};

/* 時間設定 */
const cardOpenTime = 2000;
const showBigImageOpenTime = 1500;


/* ゲームの初期設定　*/
const startup = () => {
    cardKinds.forEach((value, key) => {
        kindOfCards.push(key);
        kindOfCards.push(key);
        }
    );
    loadSetting();
    shuffleCards(kindOfCards);

    playing = numberOfPlayer;
    proceedPlayer();
};

/* カードクリック */
const clickCard = (card) => {
    if (isProcessing) return;

    // ゲーム終了後は更新できない
    if (gameFinished) {
        return;
    }

    let status = card.getAttribute("status");
    // すでに開かれているカードの場合は何もしない
    if (status === statusFinished || status === statusOpen) return;

    // 前提処理
    preClick();

    card.addEventListener("load", loadCard);
    openCard(card);
};

const loadCard = (event) => {
    const card = event.target;

    // 開いたカードの番号
    let openCardNumber = Number(card.getAttribute("card-number"));

    // 1枚目であれば、何を開いたか保存して終了
    if (openFirstCardNumber === 0) {
        openFirstCardNumber = openCardNumber;
        card.removeEventListener("load", loadCard);
        toggleModal(card.src);
        setTimeout(() => {toggleModal(card.src)}, showBigImageOpenTime);
        postClick();
        return;
    }

    toggleModal(card.src);
    setTimeout(() => {toggleModal(card.src)}, showBigImageOpenTime);

    // 種類が一致している場合
    if (kindOfCards[openCardNumber-1] === kindOfCards[openFirstCardNumber-1]) {
        correct(card);
        // 終了判定
        if (countTotalOpenCard === 40) {
            gameFinished = true;
            alert("優勝は "+judgeWinner()+" でした！");
        }
        postClick();
        return;
    }

    // 種類が一致していない場合
    setTimeout(function () {
        closeCard(card);
        closeCard(cards[openFirstCardNumber-1]);
        mistake();
        card.removeEventListener("load", loadCard);
        postClick();
    }, cardOpenTime);
};

const preClick = () => {
    isProcessing = true;
};

const postClick = () => {
    isProcessing = false;
};

/* カードを開く */
const openCard = (card) => {
    let cardNumber = Number(card.getAttribute("card-number"));
    card.src = cardKinds.get(kindOfCards[cardNumber-1].toString());
    card.setAttribute("status", statusOpen);
};

/* カードを裏返す */
const closeCard = (card) => {
    card.src = closeCardImage;
    card.setAttribute("status", statusClose);
};

/* カードシャッフル */
const shuffleCards = function shuffle(array) {
    for(let i = array.length - 1; i > 0; i--){
        let r = Math.floor(Math.random() * (i + 1));
        let tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
};

/* カードを誤った場合 */
const mistake = () => {
    openFirstCardNumber = 0;
    proceedPlayer();
};

/* カードが正しかった場合 */
const correct = (card) => {
    card.setAttribute("status", statusFinished);
    cards[openFirstCardNumber-1].setAttribute("status", statusFinished);
    addPoint(players[playing-1]);
    openFirstCardNumber = 0;
    countTotalOpenCard = countTotalOpenCard + 2;
}

/* 拡大画像表示ポップアップ */
const toggleModal = (src) => {
    const showBigImage = showBigImageArea.getElementsByClassName("showBigImage");
    showBigImage[0].src = src;
    showBigImageArea.classList.toggle('is-show');
};

/* プレイヤーを交代 */
const proceedPlayer = () => {
    let playerName = players[playing-1].getElementsByClassName("player-name")[0];
    playerName.textContent = playerName.textContent.replace("★", "");
    playing = (playing % numberOfPlayer) + 1;
    let nextPlayerName = players[playing-1].getElementsByClassName("player-name")[0];
    nextPlayerName.textContent = "★" + nextPlayerName.textContent;
};

/* 1位を判定する */
const judgeWinner = () => {
    let player1Score = Number(getScore(players[0]));
    let player2Score = Number(getScore(players[1]));
    let player3Score = Number(getScore(players[2]));
    let player4Score = Number(getScore(players[3]));

    // 同点は順番が速い方が勝利
    if (player1Score >= player2Score) {
        if (player1Score >= player3Score) {
            if (player1Score >= player4Score) {
                return "Player1";
            }
            return "Player4";
        }
        if(player3Score >= player4Score) {
            return "Player3";
        }
        return "Player4";
    }
    if (player2Score >= player3Score) {
        if (player2Score >= player4Score) {
            return "Player2";
        }
        return "Player4";
    }
    if(player3Score >= player4Score) {
        return "Player3";
    }
    return "Player4";
};

/* 得点を追加 */
const addPoint = (player) => {
    let score = getScore(player);
    player.getElementsByClassName("player-score")[0].textContent = (Number(score) + 1).toString();
};

/* 得点を取得 */
const getScore = (player) => {
    return player.getElementsByClassName("player-score")[0].textContent;
};


/********** 設定系 **********/

/* 設定 */
const setting = () => {
    let inputs = document.querySelectorAll(".input-area input");
    for (let i = 0; i < 20; i++) {
        if (inputs[i].value !== "") {
            cardKinds.set((i+1).toString(), inputs[i].value);
        }
    }
    setNumberOfPlayer();
    alert("反映完了しました");
    app();
};

/* 画像のURLを保存 */
const saveSetting = () => {
    for (let i = 0; i < 20; i++) {
        localStorage.setItem("cardKind"+i.toString(), cardKinds.get((i+1).toString()));
    }
};

/* 画像のURLをローカルストレージから復元 */
const loadSetting = () => {
    for (let i = 0; i < 20; i++) {
        if (localStorage.getItem("cardKind"+i.toString()) !== null) {
            cardKinds.set((i+1).toString(), localStorage.getItem("cardKind"+i.toString()));
        }
    }
};

/* 人数の設定 */
const setNumberOfPlayer = () => {
    numberOfPlayer = document.getElementsByName("number-of-player")[0].value;
}
