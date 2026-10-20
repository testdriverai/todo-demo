import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Todo Filter Tabs", () => {
  it("should filter active, completed, and all todos correctly", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: process.env.TEST_URL || "http://localhost:3000" });

    // Add first todo: "Buy milk"
    await testdriver.find('"What needs doing?" input field').click();
    await testdriver.type("Buy milk");
    await testdriver.find('"Add" button').click();

    // Add second todo: "Write code review"
    await testdriver.find('"What needs doing?" input field').click();
    await testdriver.type("Write code review");
    await testdriver.find('"Add" button').click();

    // Mark "Buy milk" as completed
    await testdriver.find('checkbox next to "Buy milk"').click();

    // Filter by Active
    await testdriver.find('"Active" filter button').click();
    let assertResult = await testdriver.assert('only "Write code review" is visible in the list');
    expect(assertResult).toBeTruthy();

    // Filter by Completed
    await testdriver.find('"Completed" filter button').click();
    assertResult = await testdriver.assert('only "Buy milk" is visible in the list');
    expect(assertResult).toBeTruthy();

    // Filter by All
    await testdriver.find('"All" filter button').click();
    assertResult = await testdriver.assert('both "Buy milk" and "Write code review" are visible in the list');
    expect(assertResult).toBeTruthy();

    // Delete completed task and verify empty message under Completed
    await testdriver.find('"Completed" filter button').click();
    await testdriver.find('Delete button for "Buy milk"').click();
    assertResult = await testdriver.assert('"Nothing completed yet." is displayed');
    expect(assertResult).toBeTruthy();

    // Clean up remaining task under All
    await testdriver.find('"All" filter button').click();
    await testdriver.find('Delete button for "Write code review"').click();
    assertResult = await testdriver.assert('"Nothing to do. Add your first todo above." is displayed');
    expect(assertResult).toBeTruthy();
  });
});
