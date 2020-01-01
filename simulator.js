/* Battle Flow */

async function simulate(
  count = 1,
  playerA = new Attacker(),
  playerB = new Attacker(),
  element = undefined
) {
  let aWin = 0,
    bWin = 0;
  // console.log(playerA, playerB);
  for (let i = 0; i < count; i++) {
    playerA.initStatus(true);
    playerB.initStatus(true);
    let round = 0;
    await appendAndScrollElem(element, `<br />=== Battle ${i + 1} Start ===`);
    do {
      round++;
      let battle = Player.attackEachOther(playerA, playerB);
      appendAndScrollElem(element, "<br />");
      await appendAndScrollElem(element, `<br />~ Round ${round} ~`);
      appendAndScrollElem(element, "<br />");
      await appendAndScrollElem(
        element,
        `<br />${playerA} ${battle.statusA.dice20s
          .map(Plurk.getDiceImageSrc)
          .map(Util.imageTagBuilder)
          .join("")} ${battle.statusA.bzzs
          .map(Plurk.getBzzImageSrc)
          .map(Util.imageTagBuilder)
          .join("")}`
      );
      await appendAndScrollElem(
        element,
        `<br />${playerB} ${battle.statusB.dice20s
          .map(Plurk.getDiceImageSrc)
          .map(Util.imageTagBuilder)
          .join("")} ${battle.statusB.bzzs
          .map(Plurk.getBzzImageSrc)
          .map(Util.imageTagBuilder)
          .join("")}`
      );
      appendAndScrollElem(element, "<br />");
      await appendAndScrollElem(
        element,
        `<br />${playerA} do ${battle.statusA.message}`
      );
      await appendAndScrollElem(
        element,
        `<br />${playerB} do ${battle.statusB.message}`
      );
      appendAndScrollElem(element, "<br />");
      await appendAndScrollElem(
        element,
        `<br />${playerA} attack ${battle.attacks[0]} damage!`
      );
      await appendAndScrollElem(
        element,
        `<br />${playerB} attack ${battle.attacks[1]} damage!`
      );
      appendAndScrollElem(element, "<br />");
      await appendAndScrollElem(
        element,
        `<br />${playerA} get ${battle.damages[0]} damage!`
      );
      await appendAndScrollElem(
        element,
        `<br />${playerB} get ${battle.damages[1]} damage!`
      );
      appendAndScrollElem(element, "<br />");
      await appendAndScrollElem(element, `<br />~ Round ${round} Summary ~`);
      appendAndScrollElem(element, "<br />");
      await appendAndScrollElem(
        element,
        `<br />${playerA}: HP = ${playerA.getHp()}`
      );
      await appendAndScrollElem(
        element,
        `<br />${playerB}: HP = ${playerB.getHp()}`
      );
      appendAndScrollElem(element, "<br />");
    } while (
      (playerA.getHp() > 0 && playerB.getHp() > 0) ||
      playerA.getHp() == playerB.getHp()
    );
    await appendAndScrollElem(element, `<br />=== Battle ${i + 1} End ===`);

    if (playerA.getHp() > playerB.getHp()) {
      aWin += 1;
    } else {
      bWin += 1;
    }
    // console.log(`A: ${playerA.getHp()} B: ${playerB.getHp()}`);
  }
  return `A Win: ${aWin}, B Win: ${bWin}`;
}

async function appendAndScrollElem(element, html) {
  if (element === undefined) {
    return;
  }
  element.innerHTML += html;
  element.lastElementChild.scrollIntoView();
  await Util.sleep(1000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function imageTagBuilder(src) {
  return `<img src="${src}" />`;
}
