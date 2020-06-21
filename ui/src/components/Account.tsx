import * as React from 'react';
import {AppState, withAppContext} from "../models";
import {Button, H3} from "@blueprintjs/core";
import {IconNames} from "@blueprintjs/icons";
import {SignIn} from "./SignIn";
import {signOut} from "../services/firebase";

export interface AccountProps {
    appContext: AppState;
}

export class AccountWithContext extends React.PureComponent<AccountProps> {

    constructor(props: AccountProps) {
        super(props);
    }

    render() {
        let content = <SignIn />
        if (this.props.appContext.user !== null) {
            content = (
                <div className={"user"}>
                    <H3>User Details</H3>
                    <table>
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{this.props.appContext.user.displayName}</td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td>{this.props.appContext.user.email}</td>
                            </tr>
                        </tbody>
                    </table>
                    <Button
                        text={"Sign Out"}
                        icon={IconNames.LOG_OUT}
                        onClick={() => signOut()}
                    />
                </div>
            )
        }

        return (
            <div className={"account"}>
                {content}
            </div>
        );
    }
}

export const Account = withAppContext(AccountWithContext);