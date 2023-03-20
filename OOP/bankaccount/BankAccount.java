import java.util.Random;
public class BankAccount {

	
     // instance things (belonging to a particular bank account)
    private double checkingBalance;
    private double savingsBalance;
    // static things (belonging to the BankAccount class)
	public static int numAccounts = 0;
	public static double totalHoldings = 0;


    // Ninja Bonus (Solutions vary!)
    private static int generateId() {
		Random randGenerator = new Random();
        int randomId = randGenerator.nextInt(1000000000) + 999999999;
		return randomId;
	}

   
	private int accountNumber; // Ninja Bonus (could also have been a string)

	public BankAccount() {
		BankAccount.numAccounts += 1;
		this.checkingBalance = 0;
		this.savingsBalance = 0;
		this.accountNumber = BankAccount.generateId();
	}
	
	public double getCheckingBalance() {
		return this.checkingBalance;
	}

	public double getSavingsBalance() {
		return this.savingsBalance;
	}
    public int getAccountNumber() {
        return this.accountNumber;
    }

	public void depositMoney(double amount, String account) {
		if(account.equals("savings"))
			this.savingsBalance += amount;
		else if(account.equals("checking"))
			this.checkingBalance += amount;
		BankAccount.totalHoldings += amount;
	}

	public void withdrawMoney(double amount, String account) {
		boolean successful = false;
		if(account.equals("savings")) {
			// check if enough in account
			if(this.savingsBalance - amount >= 0) {
				successful = true;
				this.savingsBalance -= amount;
			}
		}
		else if(account.equals("checking")) {
			// check if enough in account
			if(this.checkingBalance - amount >= 0) {
				successful = true;
				this.checkingBalance -= amount;
			}
		}
		if(successful) {
			BankAccount.totalHoldings -= amount;
		}
        else {
            System.out.println("Insufficient funds.");
        }
	}

	public void displayAccountBalance() {
		// %.2f formats decimal to the 10s place (like for moniez)
		System.out.println(String.format("Savings: %.2f, Checking: %.2f", this.savingsBalance, this.checkingBalance));
	}

}