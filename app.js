// MODULE - budget controler
const budgetController = (function() {
  class Expenses {
    constructor(id, desc, value) {
      this.id = id;
      this.desc = desc;
      this.value = value;
      // to the calcpercetage method
      this.percentage = -1;
    }
  }
  // add a method to expenses
  Expenses.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expenses.prototype.getPercentage = function() {
    return this.percentage;
  };

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
    deleteItem(type, id) {
      const ids = data.allItems[type].map(current => current.id);
      // find the index of the id
      const index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
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
    calculatePercentage() {
      data.allItems.exp.forEach(each => {
        each.calcPercentage(data.total.inc);
      });
    },
    getPercentages() {
      const allPerc = data.allItems.exp.map(current => current.getPercentage());
      return allPerc;
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
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };
  const formatNumber = function(num, type) {
    // +or - before number and 2 decimal points and comma separating the thousands
    num = Math.abs(num);
    num = num.toFixed(2);
    // add comma separating
    const numSplit = num.split('.');
    let int = numSplit[0];
    if (int.length > 3) {
      int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`;
    }
    const dec = numSplit[1];
    return `${type === 'exp' ? '-' : '+'} ${int}.${dec}`;
  };
  // foreach for nodelist
  const nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
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
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
      } else if (type === 'exp') {
        element = domStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div>     </div>  </div>';
      }

      // Replace with data
      let newHtml = html.replace('%id%', item.id);
      newHtml = newHtml.replace('%value%', formatNumber(item.value, type));
      newHtml = newHtml.replace('%description%', item.desc);
      // Insert HTML into the DOM

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem(selectorID) {
      const ele = document.getElementById(selectorID);
      ele.parentNode.removeChild(ele);
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
      let type;
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector(domStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(domStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(
        domStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent = `${
          obj.percentage
        } %`;
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = '---';
      }
    },
    displayPercenteges(percentages) {
      const fields = document.querySelectorAll(domStrings.expensesPercLabel);
      // foreach function to nodeList

      nodeListForEach(fields, (current, index) => {
        if (percentages[index] > 0) {
          current.textContent = `${percentages[index]}%`;
        } else {
          current.textContent = '---';
        }
      });
    },
    displayMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      document.querySelector(domStrings.dateLabel).textContent = `${
        months[month]
      } ${year}`;
    },
    changeType() {
      const fields = document.querySelectorAll(
        `${domStrings.inputType},${domStrings.inputDescription},${
          domStrings.inputValue
        }`
      );
      // make use of the foreach for nodes created before
      nodeListForEach(fields, cur => {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(domStrings.addButton).classList.toggle('red');
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
    // setting up event handler for delete (event delagation)
    document
      .querySelector(dom.container)
      .addEventListener('click', ctrlDeleteItem);

    // change the color of the input
    document
      .querySelector(dom.inputType)
      .addEventListener('change', uiCtrl.changeType);
  }

  const updateBudget = function() {
    // 1. calculate the budget
    bdCtrl.calculateBudget();
    // 2. return the budget
    const budget = bdCtrl.getBudget();
    // 3. display the budget on the UI
    uiCtrl.displayBudget(budget);
  };

  const updatePercentage = function() {
    // 1. calculate %
    bdCtrl.calculatePercentage();
    // 2. read them from budget controller
    const percentages = bdCtrl.getPercentages();
    // 3. update user interface
    uiCtrl.displayPercenteges(percentages);
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
      // 5 calculate and update budgedt
      updateBudget();
      // 6 . calculate and update %
      updatePercentage();
    }
  };

  const ctrlDeleteItem = function(event) {
    console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
    // dom traversy (want the parent node of the target ex: id income-0)
    const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      // id inc-1
      const splitID = itemID.split('-');
      const type = splitID[0];
      const sID = parseInt(splitID[1]);
      // 1. delete item from data structure
      bdCtrl.deleteItem(type, sID);
      // 2. delete from UI
      uiCtrl.deleteListItem(itemID);
      // 3. Update and show the nre budget
      updateBudget();
      // 4 . calculate and update %
      updatePercentage();
    }
  };

  return {
    init() {
      uiCtrl.displayMonth();
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
