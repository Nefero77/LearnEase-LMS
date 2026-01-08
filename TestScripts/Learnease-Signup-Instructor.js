const { Builder, Browser,By} = require("selenium-webdriver");
(async function example(){
    let driver = new Builder().forBrowser(Browser.FIREFOX).build();
    try{
    await driver.get("localhost:3000");
    const getstarted = driver.findElement(By.linkText('Get Started'));
    await getstarted.click();
    const entername = await driver.findElement(By.xpath('//form/div[1]/input'));
    await entername.sendKeys('Kushal Pandey');
    const enteremail = await driver.findElement(By.xpath('//form/div[2]/input'));
    await enteremail.sendKeys('kushalpandey1408@gmail.com');
    const enterPassword = await driver.findElement(By.xpath('//form/div[3]/input'));
    await enterPassword.sendKeys('Kushal@123');
    await driver.executeScript(`
        const select = document.querySelector("select");
        select.value = "INSTRUCTOR";
        select.dispatchEvent(new Event('change', { bubbles: true }));
    `);
    const Register = await driver.findElement(By.xpath('//button[@type="submit"]'));
    await Register.click();
    }catch(error){
        console.log(error);
    }
})();
