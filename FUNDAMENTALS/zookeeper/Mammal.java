// Create a class that has an energyLevel member variable and displayEnergy() method.
//  The displayEnergy() method should show the animal's energy level as well as return it.
   
    public class Mammal {
    protected int energyLevel;

    public Mammal(int energyLevel) {
    this.energyLevel = energyLevel;

}

public int displayEnergy(){
    System.out.println("The mammal's energy level is" + this.energyLevel);
    return this.energyLevel;

}

}

