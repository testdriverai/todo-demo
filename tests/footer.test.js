import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Todo Footer and Clear Completed", () => {
  it("should show items left counter and clear completed items", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: "https://exceptional-vacancies-charts-britannica.trycloudflare.com" });

    const assertEmpty = await testdriver.assert("the empty state message \"Nothing to do. Add your first todo above.\" is visible");
    expect(assertEmpty).toBeTruthy();

    await testdriver.find("What needs doing? input field").click();
    await testdriver.type("Buy groceries");
    await testdriver.pressKeys(["enter"]);

    const assertOneItem = await testdriver.assert("the footer displays \"1 item left\" and the \"Clear completed\" button is not visible");
    expect(assertOneItem).toBeTruthy();

    await testdriver.find("What needs doing? input field").click();
    await testdriver.type("Walk the dog");
    await testdriver.pressKeys(["enter"]);

    const assertTwoItems = await testdriver.assert("the footer displays \"2 items left\"");
    expect(assertTwoItems).toBeTruthy();

    await testdriver.find("checkbox next to Buy groceries").click();

    const assertClearVisible = await testdriver.assert("the footer displays \"1 item left\" and the \"Clear completed\" button is visible");
    expect(assertClearVisible).toBeTruthy();

    await testdriver.find("Clear completed button").click();

    const assertCleared = await testdriver.assert("only \"Walk the dog\" is in the todo list, the footer shows \"1 item left\", and the \"Clear completed\" button is not visible");
    expect(assertCleared).toBeTruthy();

    await testdriver.find("Delete button for Walk the dog").click();

    const assertEmptyAgain = await testdriver.assert("the empty state message \"Nothing to do. Add your first todo above.\" is visible and the footer is hidden");
    expect(assertEmptyAgain).toBeTruthy();
  });
});
