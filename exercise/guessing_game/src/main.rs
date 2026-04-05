use std::io;
use rand::Rng;
use std::cmp::Ordering;

fn main() {
    println!("Guessing Game");

    let secret_number = rand::thread_rng().gen_range(1..=10);

    loop {
        let mut guessed_value = String::new();
        
        println!("Enter a Random number");
        
        io::stdin()
        .read_line(&mut guessed_value)
        .expect("Failed to read line");

        let guessed_value = guessed_value.trim().parse::<i32>();
        

        match guessed_value.expect("Please type a number").cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("Congratulations! You guessed the number!");
                break;
            }
        }
    }
}
