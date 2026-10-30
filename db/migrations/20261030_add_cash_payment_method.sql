-- Apply once to an existing installation before deploying the Cash payment UI.
-- New installations already receive this enum from db/schema.sql.
ALTER TABLE PAYMENTS
    MODIFY payment_method ENUM('gcash','maribank','cash') NOT NULL;
