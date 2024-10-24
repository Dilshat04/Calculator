class Calculator {
  constructor() {
    this.state = new EmptyState(this);
    this.states = [];
    this._result = "";
    this._operations = [];
    this.parentImbalance = 0;

    this.bindDOM();
    this.bindReactiveResult();
  }

  bindReactiveResult() {
    Object.defineProperty(this, "result", {
      get: () => this._result,
      set: value => {
        this._result = value;
        this.resultNode.innerText = value;
      },
    });

    Object.defineProperty(this, "operations", {
      get: () => this._operations.join(""),
      set: value => {
        this._operations = value;
        this.operationNode.innerText = this._operations.join("");
      }
    });
  }

  bindDOM() {
    this.resultNode = document.getElementById('result');
    this.operationNode = document.getElementById('operation');
  }

  enterSymbol(symbol) {
    const state = this.state.enterSymbol(symbol);
    this.states.push(this.state);
    this.state = state;
  }

  _enterSymbol(symbol) {
    this._operations.push(symbol);
    this.operationNode.innerText = this.operations;
  }

  clear() {
    this.operations = [];
    this.result = "";
    this.state = new EmptyState(this);
    this.states = [];
  }

  deleteLast() {
    if (this.states.length === 0) {
      this.state = new EmptyState(this);
      return
    }

    this._operations.pop();
    this.operationNode.innerText = this.operations;
    this.state = this.states.pop();
  }

  calculate() {
    // TODO: сделай сам!!!
    this.result = eval(this.operations.replaceAll("x", "*"));
  }
}

class State {
  constructor(calculator) {
    this.calculator = calculator;
  }

  enterSymbol(symbol) {
    this.calculator._enterSymbol(symbol);

    return this
  }
}

class EmptyState extends State {
  enterSymbol(symbol) {
    if ("(0123456789+-".includes(symbol.toString())) {
      super.enterSymbol(symbol);
    } else {
      console.info("нельзя!!!");
      return this;
    }

    switch (symbol) {
      case "+":
        return new PlusState(this.calculator);
      case "-":
        return new MinusState(this.calculator);
      case "(":
        this.calculator.parentImbalance--;
        return new LParenState(this.calculator);
      default:
        return new DigitState(this.calculator);
    }
  }
}

class PlusState extends State {
  enterSymbol(symbol) {
    if ("(0123456789".includes(symbol.toString())) {
      super.enterSymbol(symbol);
    } else {
      console.info("нельзя!!!");
      return this;
    }

    switch (symbol) {
      case "(":
        this.calculator.parentImbalance--;
        return new LParenState(this.calculator);
      default:
        return new DigitState(this.calculator);
    }
  }
}

class MinusState extends PlusState {
}

class LParenState extends EmptyState {
  enterSymbol(symbol) {
    return super.enterSymbol(symbol);
  }
}

class RParenState extends State {
  enterSymbol(symbol) {
    if (symbol === ")" && this.calculator.parentImbalance >= 0) {
      console.log("нельзя!!!")
      return this
    }

    if (")+-/x".includes(symbol.toString())) {
      super.enterSymbol(symbol);
      this.calculator.parentImbalance++;
    } else {
      console.log("нельзя!!!", symbol)
      return this
    }

    switch (symbol) {
      case ")":
        return this
      case "+":
        return new PlusState(this.calculator);
      case "-":
        return new MinusState(this.calculator);
      case "/":
        return new DivisionState(this.calculator);
      case "x":
        return new MultiplyState(this.calculator);
      default:
        return this
    }
  }
}

class MultiplyState extends State {
  enterSymbol(symbol) {
    if ("(0123456789".includes(symbol.toString())) {
      super.enterSymbol(symbol);
    } else {
      console.info("нельзя!!!");
      return this;
    }

    switch (symbol) {
      case "(":
        this.calculator.parentImbalance--;
        return new LParenState(this.calculator);
      default:
        return new DigitState(this.calculator);
    }
  }
}

class PercentState extends MultiplyState {
}

class DivisionState extends MultiplyState {
}

class DigitState extends State {
  enterSymbol(symbol) {
    if (!")0123456789+-x%/.".includes(symbol.toString())) {
      console.info("нельзя!!!");
      return this;
    }

    switch (symbol) {
      case "+":
        super.enterSymbol(symbol);
        return new PlusState(this.calculator);
      case "-":
        super.enterSymbol(symbol);
        return new MinusState(this.calculator);
      case "x":
        super.enterSymbol(symbol);
        return new MultiplyState(this.calculator);
      case "%":
        super.enterSymbol(symbol);
        return new PercentState(this.calculator);
      case "/":
        super.enterSymbol(symbol);
        return new DivisionState(this.calculator);
      case ")":
        return this.enterRParenState(symbol);
      case ".":
        return this.enterDotState(symbol);
      default:
        super.enterSymbol(symbol);
        return this;
    }
  }

  enterRParenState(symbol) {
    if (this.calculator.parentImbalance >= 0) {
      console.info("нельзя!!!");
      return this;
    }

    super.enterSymbol(symbol);
    this.calculator.parentImbalance++;
    return new RParenState(this.calculator);
  }

  enterDotState(symbol) {
    for (let i = this.calculator.operations.length - 1; i >= 0; i--) {
      const op = this.calculator.operations[i];

      if ("+-/()x%".includes(op.toString())) {
        break
      }

      if (op === ".") {
        console.info("нельзя!!!")
        return this
      }
    }

    super.enterSymbol(symbol)
    return new DotState(this.calculator);
  }
}

class DotState extends State {
  enterSymbol(symbol) {
    if ("0123456789".includes(symbol.toString())) {
      super.enterSymbol(symbol);
      return new DigitState(this.calculator);
    } else {
      console.info("нельзя!!!");
      return this;
    }
  }
}


const calculator = new Calculator();
