class Util {
  static arrSum = arr => arr.reduce((a, b) => a + b, 0);
}

class Plurk {
  static get bz() {
    return ["黑", "藍", "紅", "綠"];
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
   * Get num bz
   * @param {Number} num quantity
   * @returns {Array}
   */
  static getBZs(num = 3) {
    let bzs = [];
    for (let i = 0; i < num; i++) {
      bzs.push(this.bz[Math.floor(Math.random() * this.bz.length)]);
    }
    return bzs;
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
    // TODO: attack 計算搬去 calcAttack 裡面
    this.attack = Util.arrSum(this.dice20s);
    this.bzs = Plurk.getBZs(3 + this.accessory.bzBonusNum);

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
    return { dice20s: this.dice20s, bzs: this.bzs, message };
  }

  /**
   * Attack each other
   * @param {Player} playerA
   * @param {Player} playerB
   * @param {Object} TODO:
   */
  static attackEachOther(playerA, playerB) {
    // TODO: 可以在 prepare 完後 return 使用技能的資訊在另外建一張表來計算 影響的數值
    let statusA = playerA.prepare();
    let statusB = playerB.prepare();

    let attacks = this.calcAttacksAfterReflex(playerA, playerB);
    let damages = [
      playerA.calcDamage(attacks[0]),
      playerB.calcDamage(attacks[1])
    ];
    playerA.makeDamage(damages[0]);
    playerB.makeDamage(damages[1]);

    // check lock skill
    Player.lockSkill(playerA, playerB);
    return { statusA, statusB, attacks, damages };
  }

  /**
   *
   * @param {Player} playerA
   * @param {Player} playerB
   * @returns {Array} [attackA, attackB]
   */
  static calcAttacksAfterReflex(playerA, playerB) {
    let attackA = playerA.calcAttack();
    let attackB = playerB.calcAttack();
    if (playerA.reflex && playerB.reflex) {
      return [attackA, attackB];
    } else if (playerA.reflex) {
      return [0, attackA + attackB];
    } else if (playerB.reflex) {
      return [attackA + attackB, 0];
    } else {
      return [attackB, attackA];
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
    return `${this.name} (${this.constructor.name})`;
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
   * Get count of BZs of specific color
   * @param {String} color Default "綠" Type of bz "紅" "藍" "黑" "綠"
   * @returns {Number}
   */
  getBZCount(color = "綠") {
    return this.bzs.filter(bz => bz == color).length;
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
    this.color = "紅";
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
    this.color = "藍";
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
    this.color = "黑";
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

function simulate(
  times = 1,
  playerA = new Attacker(),
  playerB = new Attacker(),
  element = undefined
) {
  let aWin = 0,
    bWin = 0;
  // console.log(playerA, playerB);
  for (let i = 0; i < times; i++) {
    playerA.initStatus(true);
    playerB.initStatus(true);
    let round = 0;
    if (element !== undefined) {
      element.innerHTML += "<br />=== Battle Start ===";
    }
    do {
      round++;
      let battle = Player.attackEachOther(playerA, playerB);
      if (element != undefined) {
        element.innerHTML += `<br />~ Round ${round} ~`;
        element.innerHTML += "<br />";
        element.innerHTML += `<br />${playerA} ${battle.statusA.dice20s} ${battle.statusA.bzs}`;
        element.innerHTML += `<br />${playerB} ${battle.statusB.dice20s} ${battle.statusB.bzs}`;
        element.innerHTML += "<br />";
        element.innerHTML += `<br />${playerA} use ${battle.statusA.message}`;
        element.innerHTML += `<br />${playerB} use ${battle.statusB.message}`;
        element.innerHTML += "<br />";
        element.innerHTML += `<br />${playerA} attack ${battle.attacks[0]} damage!`;
        element.innerHTML += `<br />${playerB} attack ${battle.attacks[1]} damage!`;
        element.innerHTML += "<br />";
        element.innerHTML += `<br />${playerA} get ${battle.damages[0]} damage!`;
        element.innerHTML += `<br />${playerB} get ${battle.damages[1]} damage!`;
        element.innerHTML += "<br />";
        element.innerHTML += `<br />~ Round ${round} Summary ~`;
        element.innerHTML += `<br />${playerA}: ${playerA.getHp()}`;
        element.innerHTML += `<br />${playerB}: ${playerB.getHp()}`;
      }
    } while (
      (playerA.getHp() > 0 && playerB.getHp() > 0) ||
      playerA.getHp() == playerB.getHp()
    );
    if (element !== undefined) {
      element.innerHTML += "<br />=== Battle End ===";
    }

    if (playerA.getHp() > playerB.getHp()) {
      aWin += 1;
    } else {
      bWin += 1;
    }
    // console.log(`A: ${playerA.getHp()} B: ${playerB.getHp()}`);
  }
  return `A Win: ${aWin}, B Win: ${bWin}`;
}
