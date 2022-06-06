class EligibilityService {
  validators = {
    basic: this.basicValidator,
    gt: this.gtValidator,
    in: this.inValidator,
    and: this.andValidator,
  };
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    // TODO: compute cart eligibility here.

    const conditions = this.getConditions(criteria);
    return this.validate(cart, conditions);
  }

  /**
   * Return Conditions taken from criteria-test.json and exploitable format
   * @param {*} criteria
   * @returns {object}
   */
  getConditions(criteria) {
    /*let conditions = {
      basic: [{ shopperId: "shopper-id" }],
      gt: [{ totalAti: 50 }],
      in: [
        { "products.productId": ["5449000054227"] },
        { "products.test.id": ["1"] },
      ],
      and: [
        {
          date: [
            { gt: "2021-01-01T00:00:00.000Z",
              lt: "2021-12-31T23:59:59.000Z" 
            },
          ],
        },
      ],
    };*/

    let conditions = {
      basic: [],
      gt: [],
      lt: [],
      gte: [],
      lte: [],
      in: [],
      and: [],
      or: [],
    };

    Object.entries(criteria).forEach((v) => {
      if (this.isBasicCondition(v[1])) {
        let temp = {};
        temp[v[0]] = v[1];
        conditions.basic.push(temp);
      }
      if (this.isGtCondition(v[1])) {
        let temp = {};
        temp[v[0]] = Object.values(v[1])[0];
        conditions.gt.push(temp);
      }
      if (this.isInCondition(v[1])) {
        let temp = {};
        temp[v[0]] = Object.values(v[1])[0];
        conditions.in.push(temp);
      }
      if (this.isAndCondition(v[1])) {
        let temp = {};
        temp[v[0]] = Object.values(v[1])[0];
        conditions.and.push(temp);
      }
    });
    console.log(JSON.stringify(conditions));
    return conditions;
  }

  validate(cart, conditions) {
    return Object.keys(conditions).every((condition) => {
      // condition vide
      if (conditions[condition].length === 0) {
        return true;
      }

      // [{ shopperId: "shopper-id" }]
      return conditions[condition].every((attributObj) => {
        let [attributName, conditionValue] = Object.entries(attributObj).flat();
        console.log("---------------------");
        console.log({ condition, attributObj, attributName, conditionValue });
        let isValid = this.validators[condition](
          this.getCartValues(cart, attributName),
          conditionValue
        );
        console.log({ isValid });

        return isValid;
      });
    });
  }

  /**
   * Return an Array of values for attributName
   * @param {*} cart
   * @param {*} attributName
   * @returns {Array}
   */
  getCartValues(cart, attributName) {
    let splited = attributName.split(".");
    let cartValues = [];
    /*  ex = [products, productId] 
           = [products, test, id]
    */
    if (splited.length === 1) {
      cartValues.push(cart[attributName]);
    } else {
      cartValues = splited.reduce((previous, key) => {
        if (Array.isArray(previous)) {
          return previous.map((v) => v[key]);
        } else {
          return previous[key];
        }
      }, cart);
    }
    console.log({ splited, cartValues });
    return cartValues;
  }

  isBasicCondition(condition) {
    //ex : "shopper-id"
    return typeof condition !== "object";
  }

  isGtCondition(condition) {
    //ex : {"gt": 50}
    return Object.keys(condition).length === 1 && !!condition.gt;
  }

  isLtCondition(condition) {
    //ex : {"lt": 50}
    return Object.keys(condition).length === 1 && !!condition.lt;
  }

  isGteCondition(condition) {
    //ex : {"gte": 50}
    return Object.keys(condition).length === 1 && !!condition.gte;
  }

  isLteCondition(condition) {
    //ex : {"lte": 50}
    return Object.keys(condition).length === 1 && !!condition.lte;
  }

  isInCondition(condition) {
    //ex : {"in": ["5449000054227"]}
    return (
      Object.keys(condition).length === 1 &&
      !!condition.in &&
      Array.isArray(condition.in)
    );
  }

  isAndCondition(condition) {
    //ex : {"and": {"gt": "2021-01-01T00:00:00.000Z","lt": "2021-12-31T23:59:59.000Z"}}
    return (
      Object.keys(condition).length === 1 &&
      !!condition.and &&
      Object.keys(condition.and).length > 1
    );
  }

  isOrCondition(condition) {
    //ex : {"or": {"gt": "2021-01-01T00:00:00.000Z","lt": "2021-12-31T23:59:59.000Z"}}
    return (
      Object.keys(condition).length === 1 &&
      !!condition.or &&
      Object.keys(condition.or).length > 1
    );
  }

  basicValidator(cartValues, condition) {
    console.log({ basicValidator: { cartValues, condition } });
    return cartValues.find((v) => v == condition) ? true : false;
  }

  gtValidator(cartValues, condition) {
    console.log({ gtValidator: { cartValues, condition } });
    return cartValues.find((v) => v > condition) ? true : false;
  }

  inValidator(cartValues, conditions) {
    console.log({ inValidator: { cartValues, conditions } });
    return cartValues.find((value) => conditions.includes(value))
      ? true
      : false;
  }

  andValidator(cartValues, conditions) {
    console.log({ andValidator: { cartValues, conditions } });
    return Object.keys(conditions).every((condition) => {
      return this.validators[condition](cartValues, conditions[condition]);
    });
  }

  orValidator(cartValues, conditions) {
    console.log({ andValidator: { cartValues, conditions } });
    return Object.keys(conditions).some((condition) => {
      return this.validators[condition](cartValues, conditions[condition]);
    });
  }
}

module.exports = {
  EligibilityService,
};
