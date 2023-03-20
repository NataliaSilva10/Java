public class Drink {


    //atribute to create a drink
    private String name;
    private Double price;
    private Integer numberOfOunces;

//     public Double checkPrice(){
//          return price;
// }
//     public void setPrice(Double price){
//         this.price = price;
//  

   public Drink (String name, Double price, Integer numberOfOucInteger){
        this.name = name;
        this.price = price;
        this.numberOfOunces = numberOfOunces;
   };

   
    public Double checkPrice(){
    return price;
   }

    public String getName(){
        return name;
    }

    public Integer getOunces(){
        return numberOfOunces;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Double getPrice() {
        return price;
    }
    public void setPrice(Double price) {
        this.price = price;
    }
    public Integer getNumberOfOunces() {
        return numberOfOunces;
    }
    public void setNumberOfOunces(Integer numberOfOunces) {
        this.numberOfOunces = numberOfOunces;
    }
   }

