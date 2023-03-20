import javax.swing.plaf.basic.BasicInternalFrameTitlePane.SystemMenuBar;

public class Bat extends Mammal {
    public Bat() {
    super(300);
    }

    public void Fly() {
         System.out.println("The bat takes off. Swoosh!");
         this.energyLevel -= 50;
         displayEnergy();
    }
    public void EatHumans() {
        System.out.println("The bat eats some humans and gains 25 energy.");
        this.energyLevel += 25;
    }

    public void AttackTown() {
        System.out.print("The bat attacks a town and loses 100 energy.");
        this.energyLevel -= 1; 
}
    
}
