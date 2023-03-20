public class Test {
        public static void main(String[] args) {
            BankAccount Natalia = new BankAccount();
            System.out.println("New Acc No. - " + Natalia.getAccountNumber());
            Natalia.depositMoney(100.49, "checking");
            Natalia.depositMoney(3.00, "savings");
            Natalia.displayAccountBalance();
    
            System.out.println(BankAccount.totalHoldings);
    
            Natalia.withdrawMoney(50, "checking");
            Natalia.withdrawMoney(50, "savings");
            Natalia.displayAccountBalance();
    
            System.out.println(BankAccount.totalHoldings);
    
            BankAccount Natalia2 = new BankAccount();
            System.out.println("New Acc No. - " + Natalia2.getAccountNumber());
            Natalia2.depositMoney(3, "checking");
            Natalia2.depositMoney(99, "savings");
            Natalia2.displayAccountBalance();
            Natalia2.withdrawMoney(50, "checking");
        }
    }
    