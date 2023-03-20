public class Test {
    public static void main(String[] args) {
        final Drink myDrink = new Drink("Mocha" ,2.99,12);

        // myDrink.name = "Mocha";
        // myDrink.price = 2.99;
        // myDrink.numberOfOunces= 12;


      String output = String.format(" This is our %s. It cost $%s and is %s ounces", myDrink.getName(), myDrink.checkPrice(), myDrink.getOunces());
      System.out.println(output);
    }

}