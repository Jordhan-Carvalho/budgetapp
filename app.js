// MODULE - budget controler
const budgetController = (function() {
  class Expenses {
    constructor(id, desc, value) {
      this.id = id;
      this.desc = desc;
      this.value = value;
    }
  }

  class Income {
    constructor(id, desc, value) {
      this.id = id;
      this.desc = desc;
      this.value = value;
    }
  }

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    total: {
      exp: [],
      inc: [],
    },
    budget: 0,
    percentage: -1,
  };

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    // store the sums into the data
    data.total[type] = sum;
  };

  return {
    addItem(type, desc, val) {
      let newItem;
      let ID;
      // ID = last ID +1 (create new id)
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item
      if (type === 'exp') {
        newItem = new Expenses(ID, desc, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, desc, val);
      }
      // push it into uor data sctructure
      data.allItems[type].push(newItem);
      // return the new element
      return newItem; // to have access outside
    },
    // testing the data
    checkData() {
      return data;
    },
    calculateBudget() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the budget: income - expenses
      data.budget = data.total.inc - data.total.exp;
      // calculate the % of income that we spent
      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage,
      };
    },
  };
})();

// MODULE - UI controler

const uiController = (function() {
  const domStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
  };
  return {
    getInput() {
      return {
        type: document.querySelector(domStrings.inputType).value, // will be either inc or exp
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value),
      };
    },
    addListItem(item, type) {
      let html;
      let element;
      // create HTML string placeholder
      if (type === 'inc') {
        element = domStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
      } else if (type === 'exp') {
        element = domStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div>     </div>  </div>';
      }

      // Replace with data
      let newHtml = html.replace('%id%', item.id);
      newHtml = newHtml.replace('%value%', item.value);
      newHtml = newHtml.replace('%description%', item.desc);
      // Insert HTML into the DOM

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    getDOM: (function() {
      return domStrings;
    })(),
    clearFields() {
      let fields;
      let fieldArr;
      fields = document.querySelectorAll(
        `${domStrings.inputDescription}, ${domStrings.inputValue}`
      );
      // convert list to array *fields is a alist
      fieldArr = Array.prototype.slice.call(fields);
      fieldArr.forEach(element => {
        element.value = '';
      });
      // to focus on the field after submit
      fieldArr[0].focus();
    },
    displayBudget(obj) {
      document.querySelector(domStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(domStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(domStrings.expensesLabel).textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent = `${
          obj.percentage
        } %`;
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = '---';
      }
    },
  };
})();

// MODULE - APP controller - link the modules

const appController = (function(bdCtrl, uiCtrl) {
  function setEventListeners() {
    const dom = uiController.getDOM;
    document
      .querySelector(dom.addButton)
      .addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  }

  const updateBudget = function() {
    // 1. calculate the budget
    bdCtrl.calculateBudget();
    // 2. return the budget
    const budget = bdCtrl.getBudget();
    // 3. display the budget on the UI
    uiCtrl.displayBudget(budget);
  };

  const ctrlAddItem = function() {
    // 1. get the field input data
    const input = uiCtrl.getInput();
    // IF to check if the values are valid
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. add the item to the budget controller
      const newItem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );
      // 4. add the item to the UI
      uiController.addListItem(newItem, input.type);
      // 4.5 clear the field
      uiController.clearFields();
      // calculate and update budgedt
      updateBudget();
    }
  };

  return {
    init() {
      // set display info to 0
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0,
      });
      setEventListeners();
      console.log('init sucess');
    },
  };
})(budgetController, uiController);

appController.init();
