let balance = 10000000;
let selectedChoice = null;
let gameResults = {
  d1: 1,
  d2: 1,
  d3: 1,
  total: 3,
  isTai: false,
  isChan: true,
  win: false,
  bet: 0,
  special: null,
};

function updateBalance() {
  document.getElementById("balance").innerText =
    balance.toLocaleString("vi-VN");
  if (balance <= 0) {
    alert("Bạn đã hết tiền trong ví! Hệ thống sẽ mở bảng nạp tiền.");
    openDepositModal();
  }
}

function openDepositModal() {
  let modal = document.getElementById("deposit-modal");
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

function closeDepositModal() {
  let modal = document.getElementById("deposit-modal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function confirmDeposit() {
  let amount = parseInt(document.getElementById("deposit-amount").value);
  if (isNaN(amount) || amount <= 0) {
    alert("Vui lòng nhập số tiền hợp lệ!");
    return;
  }
  balance += amount;
  updateBalance();
  alert(`Nạp thành công +${amount.toLocaleString("vi-VN")} VNĐ vào tài khoản!`);
  closeDepositModal();
}

function addChip(amount) {
  let input = document.getElementById("bet-amount");
  let current = parseInt(input.value) || 0;
  input.value = current + amount;
}

function resetBet() {
  document.getElementById("bet-amount").value = 0;
}

function selectChoice(choice) {
  selectedChoice = choice;
  let buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach((btn) => btn.classList.remove("selected"));
  document.querySelector(`[data-choice="${choice}"]`).classList.add("selected");
}

function playGame() {
  let betAmount = parseInt(document.getElementById("bet-amount").value);
  if (isNaN(betAmount) || betAmount <= 0) {
    alert("Vui lòng nhập số tiền cược hợp lệ!");
    return;
  }
  if (betAmount > balance) {
    alert("Số dư trong ví không đủ! Vui lòng bấm '+ Nạp Tiền'.");
    openDepositModal();
    return;
  }
  if (!selectedChoice) {
    alert("Vui lòng chọn cửa cược (Tài/Xỉu/Chẵn/Lẻ)!");
    return;
  }

  gameResults.bet = betAmount;

  document.getElementById("roll-btn").setAttribute("disabled", "true");
  document
    .querySelectorAll(".choice-btn")
    .forEach((btn) => btn.setAttribute("disabled", "true"));

  document.getElementById("result-section").classList.add("hidden");
  document.getElementById("bowl-container").classList.add("hidden");

  let statusBox = document.getElementById("status-box");
  statusBox.classList.remove("hidden");

  // Tỷ lệ trúng Jackpot 7-7-7 là 1 / 1.000.000.000 (1e-9)
  let isJackpot = Math.random() < 0.000000001;

  let d1,
    d2,
    d3,
    total,
    win = false,
    special = null;

  if (isJackpot) {
    d1 = 7;
    d2 = 7;
    d3 = 7;
    total = 21;
    win = true;
    special = "JACKPOT";
  } else {
    // Gieo xúc xắc bình thường từ 1 đến 6
    d1 = Math.floor(Math.random() * 6) + 1;
    d2 = Math.floor(Math.random() * 6) + 1;
    d3 = Math.floor(Math.random() * 6) + 1;
    total = d1 + d2 + d3;
    gameResults.isTai = total >= 11 && total <= 18;
    gameResults.isChan = total % 2 == 0;

    if (selectedChoice == 1 && gameResults.isTai) win = true;
    else if (selectedChoice == 2 && !gameResults.isTai) win = true;
    else if (selectedChoice == 3 && gameResults.isChan) win = true;
    else if (selectedChoice == 4 && !gameResults.isChan) win = true;
  }

  gameResults.d1 = d1;
  gameResults.d2 = d2;
  gameResults.d3 = d3;
  gameResults.total = total;
  gameResults.win = win;
  gameResults.special = special;

  setTimeout(() => {
    statusBox.classList.add("hidden");

    document.getElementById("dice1").innerText = d1;
    document.getElementById("dice2").innerText = d2;
    document.getElementById("dice3").innerText = d3;

    let bowl = document.getElementById("bowl");
    bowl.style.transform = "translate(0px, 0px)";
    bowl.style.opacity = "1";
    bowl.classList.remove("opened");

    document.getElementById("bowl-container").classList.remove("hidden");
  }, 3000);
}

const bowl = document.getElementById("bowl");
let isDragging = false;
let startX, startY;

bowl.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  bowl.style.transition = "none";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  let dx = e.clientX - startX;
  let dy = e.clientY - startY;
  bowl.style.transform = `translate(${dx}px, ${dy}px)`;

  if (Math.hypot(dx, dy) > 90) {
    isDragging = false;
    openBowl();
  }
});

window.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    bowl.style.transition = "transform 0.3s ease";
    bowl.style.transform = "translate(0px, 0px)";
  }
});

function openBowl() {
  let bowl = document.getElementById("bowl");
  bowl.style.transition = "transform 0.5s ease, opacity 0.5s ease";
  bowl.style.transform = "translate(150px, -150px) scale(0.8)";
  bowl.style.opacity = "0";
  bowl.classList.add("opened");

  setTimeout(() => {
    let outcomeMsg = document.getElementById("outcome-message");

    if (gameResults.special === "JACKPOT") {
      let jackpotBonus = gameResults.bet * 1000;
      balance += jackpotBonus;
      document.getElementById("total-score").innerText =
        `Tổng điểm: ${gameResults.total} (JACKPOT 7-7-7)`;
      outcomeMsg.innerText = `🎉 NỔ HŨ JACKPOT! Trúng 7-7-7 tỷ lệ 1/1 tỷ! Nhận thưởng khủng +${jackpotBonus.toLocaleString("vi-VN")} VNĐ!`;
      outcomeMsg.className = "outcome-message win";
    } else {
      let taiXiuStr = gameResults.isTai ? "TÀI" : "XỈU";
      let chanLeStr = gameResults.isChan ? "CHẴN" : "LẺ";
      document.getElementById("total-score").innerText =
        `Tổng điểm: ${gameResults.total} (${taiXiuStr} - ${chanLeStr})`;

      if (gameResults.win) {
        balance += gameResults.bet;
        outcomeMsg.innerText = `CHÚC MỪNG! Bạn đã giành chiến thắng +${gameResults.bet.toLocaleString("vi-VN")} VNĐ!`;
        outcomeMsg.className = "outcome-message win";
      } else {
        balance -= gameResults.bet;
        outcomeMsg.innerText = `TIẾC QUÁ! Bạn đã thua cược -${gameResults.bet.toLocaleString("vi-VN")} VNĐ!`;
        outcomeMsg.className = "outcome-message lose";
      }
    }

    updateBalance();
    document.getElementById("result-section").classList.remove("hidden");

    document.getElementById("roll-btn").removeAttribute("disabled");
    document
      .querySelectorAll(".choice-btn")
      .forEach((btn) => btn.removeAttribute("disabled"));
  }, 400);
}
function openWithdrawModal() {
  let modal = document.getElementById("withdraw-modal");
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

function closeWithdrawModal() {
  let modal = document.getElementById("withdraw-modal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function confirmWithdraw() {
  let amount = parseInt(document.getElementById("withdraw-amount").value);
  if (isNaN(amount) || amount <= 0) {
    alert("Vui lòng nhập số tiền rút hợp lệ!");
    return;
  }
  if (amount > balance) {
    alert("Số dư trong ví không đủ để rút số tiền này!");
    return;
  }
  balance -= amount;
  updateBalance();
  alert(
    `Rút thành công -${amount.toLocaleString("vi-VN")} VNĐ về tài khoản ngân hàng của bạn!`,
  );
  closeWithdrawModal();
}
