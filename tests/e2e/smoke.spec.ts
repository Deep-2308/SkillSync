import { test, expect } from "@playwright/test";

test.describe("Full Platform Lifecycle Smoke Test", () => {
  // Use a unique suffix to avoid collisions in DB
  const uniqueId = Date.now();
  const clientEmail = `client_${uniqueId}@example.com`;
  const freelancerEmail = `freelancer_${uniqueId}@example.com`;
  const password = "Password123!";

  test("runs the full money-path lifecycle", async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();

    // 1. Register Client
    await page1.goto("/register");
    await page1.fill('input[name="name"]', "Test Client");
    await page1.fill('input[name="email"]', clientEmail);
    await page1.fill('input[name="password"]', password);
    await page1.click('button[type="submit"]');
    
    // Onboarding - Select Client
    await page1.waitForURL("/onboarding");
    await page1.click("text=I'm a Client");
    await page1.click('button:has-text("Complete Setup")');
    await page1.waitForURL("/dashboard");

    // 2. Post a Project
    await page1.goto("/post-project");
    await page1.fill('input[name="title"]', "Build a test app");
    await page1.fill('textarea[name="description"]', "This is a detailed description of the project that meets the minimum length requirement.");
    await page1.click('button:has-text("Next")');
    
    // Skills
    await page1.fill('input[placeholder="e.g., React"]', "React");
    await page1.keyboard.press("Enter");
    await page1.click('button:has-text("Next")');
    
    // Budget
    await page1.fill('input[name="budgetMin"]', "500");
    await page1.fill('input[name="budgetMax"]', "1000");
    await page1.click('button:has-text("Post Project")');
    
    await page1.waitForURL(/\/projects\/.+/);
    const projectUrl = page1.url();

    // 3. Register Freelancer
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto("/register");
    await page2.fill('input[name="name"]', "Test Freelancer");
    await page2.fill('input[name="email"]', freelancerEmail);
    await page2.fill('input[name="password"]', password);
    await page2.click('button[type="submit"]');
    
    // Onboarding - Select Freelancer
    await page2.waitForURL("/onboarding");
    await page2.click("text=I'm a Freelancer");
    await page2.fill('input[name="headline"]', "React Developer");
    await page2.fill('textarea[name="bio"]', "I build apps.");
    await page2.fill('input[placeholder="e.g., React"]', "React");
    await page2.keyboard.press("Enter");
    await page2.click('button:has-text("Complete Setup")');
    await page2.waitForURL("/dashboard");

    // 4. Submit a Bid
    await page2.goto(projectUrl);
    await page2.click('button:has-text("Submit Proposal")');
    
    await page2.fill('input[name="proposedRate"]', "750");
    await page2.fill('input[name="timeline"]', "1 week");
    await page2.fill('textarea[name="message"]', "I can build this very well.");
    await page2.click('button:has-text("Submit Proposal")');
    
    await page2.waitForSelector('text=Proposal submitted successfully');

    // 5. Accept Bid (Client)
    await page1.reload();
    await page1.click('text=Proposals');
    await page1.click('button:has-text("View")'); // Open Proposal dialog
    await page1.click('button:has-text("Accept & Hire")');
    await page1.click('button:has-text("Confirm & Hire")');
    
    await page1.waitForURL(/\/contracts\/.+/);
    const contractUrl = page1.url();

    // 6. Fund Contract (Stripe test card)
    await page1.click('button:has-text("Fund Contract")');
    
    // Wait for Stripe Elements iframe and fill card
    // Note: In a real environment we would locate the Stripe iframe.
    // For this mock E2E we'll simulate clicking "Fund" on our internal API mock 
    // or assume the Payment Intent form is present.
    // Assuming we have a test route or elements are rendered:
    const frame = page1.frameLocator('iframe[name^="__privateStripeFrame"]');
    await frame.locator('input[name="cardnumber"]').fill("4242424242424242");
    await frame.locator('input[name="exp-date"]').fill("12/34");
    await frame.locator('input[name="cvc"]').fill("123");
    
    await page1.click('button:has-text("Pay $750")');
    await page1.waitForSelector('text=Contract Funded');

    // 7. Mark Delivered (Freelancer)
    await page2.goto(contractUrl);
    await page2.click('button:has-text("Submit Deliverables")');
    await page2.click('button:has-text("Confirm")');
    await page2.waitForSelector('text=Waiting for client approval');

    // 8. Mark Completed (Client)
    await page1.reload();
    await page1.click('button:has-text("Approve & Complete")');
    await page1.click('button:has-text("Confirm Approval")');
    await page1.waitForSelector('text=Contract Completed');

    // 9. Leave a Review (Client)
    await page1.click('button:has-text("Leave a Review")');
    await page1.click('div.flex > svg.lucide-star:nth-child(5)'); // 5 stars
    await page1.fill('textarea[name="comment"]', "Great work!");
    await page1.click('button:has-text("Submit Review")');
    await page1.waitForSelector('text=Review submitted');

    // Close contexts
    await context.close();
    await context2.close();
  });
});
