const { Builder, Browser,By} = require("selenium-webdriver");
(async function example(){
    let driver = new Builder().forBrowser(Browser.FIREFOX).build();
    try{
        await driver.get("localhost:3000");
        const login = driver.findElement(By.linkText('Login'));
        await login.click();
        const enteremail = await driver.findElement(By.xpath('//form/div[1]/input'));
        await enteremail.sendKeys('kushalpandey1408@gmail.com');
        const enterPassword = await driver.findElement(By.xpath('//form/div[2]/input'));
        await enterPassword.sendKeys('Kushal@123');
        const loginButton = await driver.findElement(By.xpath('//button[@type="submit"]'));
        await loginButton.click();
    }catch(error){
        console.log(error);
    }
})();
