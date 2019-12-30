class Util {
  static arrSum(arr) {
    return arr.reduce((a, b) => a + b, 0);
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static imageTagBuilder(src) {
    return `<img src="${src}" />`;
  }
}

class ProjectP {
  static get roleImage() {
    return {
      Attacker:
        "https://static.wixstatic.com/media/3ae3d1_e62b40bd6b544176a573054db0a07864~mv2.png/v1/fill/w_19,h_20,al_c,lg_1,q_80/Item__07.webp",
      Defenser:
        "https://static.wixstatic.com/media/3ae3d1_23060fcddd2a4ca28a12560143f655fd~mv2.png/v1/fill/w_19,h_20,al_c,lg_1,q_80/Item__25.webp",
      Supporter:
        "https://static.wixstatic.com/media/3ae3d1_25a789ad5f884d1a9a85068593600269~mv2.png/v1/fill/w_19,h_20,al_c,lg_1,q_80/Item__23.webp"
    };
  }
  static getRoleImageSrc(role) {
    return ProjectP.roleImage[role];
  }
}

class Plurk {
  static get diceImage() {
    return {
      1: "https://s.plurk.com/a517007a048ca131f7f1d778d1af9684.png",
      2: "https://s.plurk.com/27866de1cbed77d98cd8a886205c9dcb.png",
      3: "https://s.plurk.com/1a5cc269b657e7a814aca8aba27fa64f.png",
      4: "https://s.plurk.com/dcdec54c7152053492e01800b81e0e15.png",
      5: "https://s.plurk.com/bdd7628d6c87271ac349c84a24b5f138.png",
      6: "https://s.plurk.com/33203dae72cad566e2a140b531f802f2.png",
      7: "https://s.plurk.com/ff94b39b3f0927042f8479fac0fd92d1.png",
      8: "https://s.plurk.com/ad61d499e90390b525bcb1315e6f8e5c.png",
      9: "https://s.plurk.com/d305cc0e3cdf2ec56e6c9baa7c684f4a.png",
      10: "https://s.plurk.com/8f36fda06d7b86c7f612974b3ea52bdd.png",
      11: "https://s.plurk.com/d305cc0e3cdf2ec56e6c9baa7c684f4a.png",
      12: "https://s.plurk.com/3f8817112e4c988c89d8467e424f4feb.png",
      13: "https://s.plurk.com/73ca275f83000a6ddf34f98ab8759acc.png",
      14: "https://s.plurk.com/565fefd777bff763bf53bb2cf8f6f0f0.png",
      15: "https://s.plurk.com/611615a7152225c461050a3569ea1a2d.png",
      16: "https://s.plurk.com/1a33f859f00b5d98944892ee9333eb7c.png",
      17: "https://s.plurk.com/eacfe781bac35c429c2d747f3fd1ba94.png",
      18: "https://s.plurk.com/c7907086d6db450a140f5192baa88f37.png",
      19: "https://s.plurk.com/cf737a26669f491dd38e534007ea5dc4.png",
      20: "https://s.plurk.com/22ecc6bed8b99c6a111d5dbc65dc08fd.png"
    };
  }

  static get bzzImage() {
    return {
      R: "https://s.plurk.com/129b757f2346a6e5ea782c79f0337ba9.png",
      G: "https://s.plurk.com/5a2a63fa773e68797ec69a1303bfa3b9.png",
      B: "https://s.plurk.com/e3481a0219283c49455d8af6012980ea.png",
      K: "https://s.plurk.com/7bd4d66256fc805da4dd178b9fdbe3ce.png"
    };
  }

  static getDiceImageSrc(num) {
    return Plurk.diceImage[num];
  }

  static getBzzImageSrc(color) {
    return Plurk.bzzImage[color];
  }

  static get bz() {
    return ["R", "G", "B", "K"];
  }
  /**
   * Get sum of N dice 20
   * @param {Number} num quantity
   * @returns {Number}
   */
  static getDice20s(num = 1) {
    let dice20s = [];
    for (let i = 0; i < num; i++) {
      dice20s.push(Math.floor(20 * Math.random() + 1));
    }
    return dice20s;
  }
  /**
   * Get num bzz
   * @param {Number} num quantity
   * @returns {Array}
   */
  static getBzzs(num = 3) {
    let bzzs = [];
    for (let i = 0; i < num; i++) {
      bzzs.push(this.bz[Math.floor(Math.random() * this.bz.length)]);
    }
    return bzzs;
  }
}

class Player {
  /**
   * Player constructor
   * @param {String} name
   * @param {Weapon} weapon
   * @param {Armour} armour
   * @param {Accessory} accessory
   */
  constructor(
    name = "",
    weapon = new Weapon(),
    armour = new Armour(),
    accessory = new Accessory()
  ) {
    this.name = name;
    this.weapon = weapon;
    this.armour = armour;
    this.accessory = accessory;
    this.initStatus();
  }

  initStatus(first = true) {
    this.attack = 0;
    this.attackRate = this.weapon.attackRate;
    this.attackBonus = this.weapon.attackBonus;
    this.defenseRate = this.armour.defenseRate;
    this.defenseBonus = this.armour.defenseBonus;
    this.reflex = false;

    if (first) {
      this.hp = 100;
      this.delayToLockSkill = false;
      this.skillLocked = false;
    }
  }

  /**
   * Prepare some attributes to calculate damage.
   */
  prepare() {
    // init status
    this.initStatus(false);

    this.dice20s = Plurk.getDice20s(1 + this.weapon.dice20BonusNum);
    // TODO: move attack calc to @method calcAttack
    this.attack = Util.arrSum(this.dice20s);
    this.bzzs = Plurk.getBzzs(3 + this.accessory.bzBonusNum);

    // check skill
    let message = "Nothing!";
    if (this.canUseSkill()) {
      message = "Use skill!";
      this.useSkill();
    } else if (this.canUseUltraSkill()) {
      message = "Use ultra skill!";
      this.useUltraSkill();
    } else if (this.isSmallMistake()) {
      message = "Make small mistake!";
      this.makeSmallMistake();
    } else if (this.isBigMistake()) {
      message = "Make big mistake!";
      this.makeBigMistake();
    }
    return { dice20s: this.dice20s, bzzs: this.bzzs, message };
  }

  /**
   * Attack each other
   * @param {Player} playerA
   * @param {Player} playerB
   * @param {Object}
   */
  static attackEachOther(playerA, playerB) {
    // NOTE: 可以在 prepare 完後 return 使用技能的資訊在另外建一張表來計算 影響的數值
    let statusA = playerA.prepare();
    let statusB = playerB.prepare();

    let attacks = this.calcAttacksAfterReflex(playerA, playerB);
    let damages = [
      playerA.calcDamage(attacks[1]),
      playerB.calcDamage(attacks[0])
    ];
    playerA.makeDamage(damages[0]);
    playerB.makeDamage(damages[1]);

    // check lock skill
    Player.lockSkill(playerA, playerB);
    // TODO: arrange the object to { a: ~~~ , b: ~~~ }
    return { statusA, statusB, attacks, damages };
  }

  /**
   *
   * @param {Player} playerA
   * @param {Player} playerB
   * @returns {Array} the strength of attack [attackA, attackB]
   */
  static calcAttacksAfterReflex(playerA, playerB) {
    let attackA = playerA.calcAttack();
    let attackB = playerB.calcAttack();
    if (playerA.reflex && playerB.reflex) {
      return [attackB, attackA];
    } else if (playerA.reflex) {
      return [attackA + attackB, 0];
    } else if (playerB.reflex) {
      return [0, attackA + attackB];
    } else {
      return [attackA, attackB];
    }
  }

  static lockSkill(playerA, playerB) {
    if (playerA.delayToLockSkill) {
      playerA.delayToLockSkill = false;

      playerB.skillLocked = true;
    } else {
      playerB.skillLocked = false;
    }
    if (playerB.delayToLockSkill) {
      playerB.delayToLockSkill = false;

      playerA.skillLocked = true;
    } else {
      playerA.skillLocked = false;
    }
  }

  toString() {
    return `${this.name} (${Util.imageTagBuilder(
      ProjectP.getRoleImageSrc(this.constructor.name)
    )})`;
  }

  getHp() {
    return this.hp;
  }

  /**
   * @returns {Number}
   */
  calcAttack() {
    return this.attack * this.attackRate + this.attackBonus;
  }

  /**
   *
   * @param {Number} damage
   * @returns {Number}
   */
  calcDamage(damage) {
    if (this.defenseRate == 0) {
      throw "defenseRate could not be 0";
    }
    damage = Math.max(
      Math.ceil(damage / this.defenseRate - this.defenseBonus),
      0
    );
    // NOTE: 攻擊失誤
    if (this.isBigMistake()) {
      damage *= 2;
    }
    return damage;
  }

  makeDamage(damage) {
    this.hp -= damage;
  }

  /**
   * Get count of Bzzs of specific color
   * @param {String} color Default "G" Type of bzz "R" "G" "B" "K"
   * @returns {Number}
   */
  getBZCount(color = "G") {
    return this.bzzs.filter(bzz => bzz == color).length;
  }

  /**
   * @returns {Boolean}
   */
  isSmallMistake() {
    return this.getBZCount() == 2;
  }

  /**
   * @returns {Boolean}
   */
  isBigMistake() {
    return this.getBZCount() >= 3;
  }

  makeSmallMistake() {
    this.attack = 0;
  }

  makeBigMistake() {
    this.attack = 0;
    // NOTE: 攻擊失誤傷害是算完防具減傷後才計算故搬遷至 calcDamage
  }
  /**
   * @returns {Boolean}
   */
  canUseSkill() {
    if (this.skillLocked) {
      return false;
    }
    return this.getBZCount(this.color) == 2;
  }

  canUseUltraSkill() {
    if (this.skillLocked) {
      return false;
    }
    return this.getBZCount(this.color) >= 3;
  }

  useSkill() {
    throw "Skill not implemented";
  }

  useUltraSkill() {
    throw "Skill not implemented";
  }
}

/* Item */

class Item {
  constructor(name = "") {}
}

class Weapon extends Item {
  constructor(dice20BonusNum = 0, attackRate = 1, attackBonus = 0) {
    super();
    this.dice20BonusNum = dice20BonusNum;
    this.attackRate = attackRate;
    this.attackBonus = attackBonus;
  }
}

class Armour extends Item {
  constructor(defenseRate = 1, defenseBonus = 0) {
    super();
    this.defenseRate = defenseRate;
    this.defenseBonus = defenseBonus;
  }
}

class Accessory extends Item {
  constructor(bzBonusNum = 0) {
    super();
    this.bzBonusNum = bzBonusNum;
  }
}

/* Role */
class Attacker extends Player {
  constructor(name = "", weapon, armour, accessory) {
    super(name, weapon, armour, accessory);
    this.color = "R";
  }

  useSkill() {
    this.attackBonus += 5;
  }
  useUltraSkill() {
    this.attackRate *= 2;
    this.delayToLockSkill = true;
  }
}

class Defenser extends Player {
  constructor(name = "", weapon, armour, accessory) {
    super(name, weapon, armour, accessory);
    this.color = "B";
  }

  useSkill() {
    this.defenseRate *= 2;
  }

  useUltraSkill() {
    this.reflex = true;
  }
}

class Supporter extends Player {
  constructor(name, weapon, armour, accessory) {
    super(name, weapon, armour, accessory);
    this.color = "K";
  }

  fixOverHeal() {
    if (this.hp > 100) {
      this.hp = 100;
    }
  }

  useSkill() {
    this.hp += 5;
    this.fixOverHeal();
  }

  useUltraSkill() {
    this.hp += 20;
    this.fixOverHeal();
  }
}

/* Battle Logic */

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
