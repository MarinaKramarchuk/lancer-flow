import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Heading,
  Text,
  Section,
} from "@react-email/components";
import React from "react";

type EmailData = {
  budgetAmount?: number;
  totalExpenses?: number;
  percentageUsed?: number;
  accountName?: string;
  month?: string;
  stats?: {
    totalIncome: number;
    totalExpenses: number;
    byCategory: Record<string, number>;
  };
}

type EmailProps = {
  userName: string;
  type: "budget-alert" | "monthly-report";
  data: EmailData;
}

export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = { },
}: EmailProps) {
  const { budgetAmount = 0, totalExpenses = 0, percentageUsed = 0 } = data;
  if (type === "monthly-report") {
    const { month = "", stats } = data;
    const totalIncome = stats?.totalIncome ?? 0;
    const monthlyExpenses = stats?.totalExpenses ?? 0;
    const byCategory = stats?.byCategory ?? {};
    const categoryEntries = Object.entries(byCategory).sort(
      ([, a], [, b]) => b - a,
    );

    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Financial Report</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              Here&rsquo;s your financial summary for {month}.
            </Text>
            <Section style={styles.startsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Income</Text>
                <Text style={styles.heading}>${totalIncome.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Expenses</Text>
                <Text style={styles.heading}>
                  ${monthlyExpenses.toFixed(2)}
                </Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Net</Text>
                <Text style={styles.heading}>
                  ${(totalIncome - monthlyExpenses).toFixed(2)}
                </Text>
              </div>
            </Section>

            {categoryEntries.length > 0 && (
              <Section style={styles.startsContainer}>
                <Text style={styles.heading}>Expenses by Category</Text>
                {categoryEntries.map(([category, amount]) => (
                  <div key={category} style={styles.categoryRow}>
                    <Text style={styles.text}>{category}</Text>
                    <Text style={styles.text}>${amount.toFixed(2)}</Text>
                  </div>
                ))}
              </Section>
            )}
          </Container>
        </Body>
      </Html>
    );
  }
  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Budget Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              You&rsquo;ve yoused {percentageUsed.toFixed(1)}% of your
              monthly budget.
            </Text>
            <Section style={styles.startsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Budget Amount</Text>
                <Text style={styles.heading}>${budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Spent So Far</Text>
                <Text style={styles.heading}>${totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Remaining</Text>
                <Text style={styles.heading}>${budgetAmount - totalExpenses}</Text>
              </div>

            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 20px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  startsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
  },
  stat: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
  },
  categoryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
  },
};
