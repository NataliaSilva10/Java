// Create a separate class Gorilla that can throwSomething(), eatBananas(), and climb()

public class Gorilla extends Mammal {
   
   
    public int energyLevel;
    public Gorilla (int energyLevel){
        super(energyLevel);
    }

    public void throwSomething() {
    System.out.println("the gorilla is thowing something");
     this.energyLevel =- 2;
    }
    public void eatBananas(){
    System.out.println("the gorilla ate a banana");
    this.energyLevel += 5;
    }
    public void jump(){
    System.out.println("the gorilla is jumping");
    this.energyLevel -= 5;
    }
}
