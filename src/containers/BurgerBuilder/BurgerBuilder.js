import React, { Component } from 'react';

import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders.js';
import Spinner from '../../components/UI/Spinner/Spinner.js';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
   salad: 0.5,
   cheese: 0.4,
   meat: 1.3,
   bacon: 0.7,
};

class BurgerBuilder extends Component {
   // constructor(props) {
   //     super(props);
   //     this.state = {...}
   // }
   state = {
      ingredients: null,
      totalPrice: 4,
      purchasable: false,
      puchasing: false,
      loading: false,
      error: false,
   };

   componentDidMount() {
      axios
         .get(
            'https://react-my-burger-e068b-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json'
         )
         .then((response) => {
            this.setState({ ingredients: response.data });
         })
         .catch((error) => {
            this.setState({ error: true });
         });
   }

   updatePurchaseState(ingredients) {
      const sum = Object.keys(ingredients)
         .map((igKey) => {
            return ingredients[igKey];
         })
         .reduce((sum, el) => {
            return sum + el;
         }, 0);

      this.setState({ purchasable: sum > 0 });
   }

   addIngredientHandler = (type) => {
      const oldCount = this.state.ingredients[type];
      const updatedCounted = oldCount + 1;
      const updatedIngredients = {
         ...this.state.ingredients,
      };
      updatedIngredients[type] = updatedCounted;
      const priceAddition = INGREDIENT_PRICES[type];
      const oldPrice = this.state.totalPrice;
      const newPrice = oldPrice + priceAddition;

      this.setState({ totalPrice: newPrice, ingredients: updatedIngredients });
      this.updatePurchaseState(updatedIngredients);
   };

   removeIngredientHandler = (type) => {
      const oldCount = this.state.ingredients[type];
      if (oldCount <= 0) {
         return;
      }
      const updatedCounted = oldCount - 1;
      const updatedIngredients = {
         ...this.state.ingredients,
      };
      updatedIngredients[type] = updatedCounted;
      const priceDeduction = INGREDIENT_PRICES[type];
      const oldPrice = this.state.totalPrice;
      const newPrice = oldPrice - priceDeduction;

      this.setState({ totalPrice: newPrice, ingredients: updatedIngredients });
      this.updatePurchaseState(updatedIngredients);
   };

   purchaseHandler = () => {
      this.setState({ purchasing: true });
   };

   purchaseCancelHandler = () => {
      this.setState({ purchasing: false });
   };

   purchaseContinueHandler = () => {
      // alert('Give me your money!!');
      this.setState({ loading: true });
      const order = {
         ingredients: this.state.ingredients,
         price: this.state.totalPrice,
         customer: {
            name: 'Diogo',
            adress: {
               street: 'teststreet',
               zipCode: '4000',
               country: 'Portugal',
            },
            email: 'diogo@gmail.com',
         },
         deliveryMethod: 'fastest',
      };
      axios
         .post('/orders.json', order)
         .then((response) => {
            this.setState({ loading: false, purchasing: false });
         })
         .catch((error) => {
            this.setState({ loading: false, purchasing: false });
         });
   };

   render() {
      const disableInfo = {
         ...this.state.ingredients,
      };
      for (let key in disableInfo) {
         disableInfo[key] = disableInfo[key] <= 0;
      }
      let orderSummary = null;

      if (this.state.loading) {
         orderSummary = <Spinner />;
      }
      let burger = this.state.error ? (
         <p>Ingredients cannot be loaded!</p>
      ) : (
         <Spinner />
      );
      if (this.state.ingredients) {
         burger = (
            <Aux>
               <Burger ingredients={this.state.ingredients} />
               <BuildControls
                  ingredientAdded={this.addIngredientHandler}
                  ingredientRemoved={this.removeIngredientHandler}
                  disabled={disableInfo}
                  price={this.state.totalPrice}
                  ordered={this.purchaseHandler}
                  purchasable={this.state.purchasable}
               />
            </Aux>
         );
         orderSummary = (
            <OrderSummary
               price={this.state.totalPrice.toFixed(2)}
               purchaseCancelled={this.purchaseCancelHandler}
               purchaseContinued={this.purchaseContinueHandler}
               ingredients={this.state.ingredients}
            ></OrderSummary>
         );
      }
      if (this.state.loading) {
         orderSummary = <Spinner />;
      }

      return (
         <Aux>
            <Modal
               show={this.state.purchasing}
               modalClosed={this.purchaseCancelHandler}
            >
               {orderSummary}
            </Modal>
            {burger}
         </Aux>
      );
   }
}

export default withErrorHandler(BurgerBuilder, axios);
