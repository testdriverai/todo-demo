import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Inline Todo Editing", () => {
  it("edits a todo title in place, preserves other row actions, and deletes on empty", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: process.env.TEST_URL || "http://localhost:3000" });

    // Add first todo
    await testdriver.find("What needs doing input field").click();
    await testdriver.type("Buy oat milk");
    await testdriver.pressKeys(["enter"]);

    let assertResult = await testdriver.assert("the todo 'Buy oat milk' is displayed in the list");
    expect(assertResult).toBeTruthy();

    // Double-click title to enter inline editing mode
    await testdriver.find("Buy oat milk todo title").doubleClick();

    // Edit title and blur by clicking header to commit
    await testdriver.type("Buy almond milk");
    await testdriver.find("Todos header title").click();

    assertResult = await testdriver.assert("the todo item is saved as 'Buy almond milk'");
    expect(assertResult).toBeTruthy();

    // Add second todo
    await testdriver.find("What needs doing input field").click();
    await testdriver.type("Second item");
    await testdriver.pressKeys(["enter"]);

    // Edit first item and blur by clicking the other row's checkbox
    await testdriver.find("Buy almond milk todo title").doubleClick();
    await testdriver.type("Updated first item");
    await testdriver.find("checkbox for Second item").click();

    assertResult = await testdriver.assert("'Updated first item' is saved and 'Second item' is completed with 1 item left");
    expect(assertResult).toBeTruthy();

    // Clear title to delete item
    await testdriver.find("Updated first item todo title").doubleClick();
    await testdriver.pressKeys(["backspace"]);
    await testdriver.find("Todos header title").click();

    assertResult = await testdriver.assert("'Updated first item' is deleted and only 'Second item' remains");
    expect(assertResult).toBeTruthy();
  });
});
