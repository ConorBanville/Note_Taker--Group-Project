import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

//Custom Page Components
import { HomeComponent } from "./home/home.component";
import { NotesComponent } from "./notes/notes.component";
import { ChatComponent } from "./chat/chat.component";
import { LoginComponent } from "./account/login/login.component";
import { RegisterComponent } from "./account/register/register.component";
import { ForgotPasswordComponent } from "./account/forgot-password/forgot-password.component";
import { ResetPasswordFrom } from "./account/forgot-password/reset-form/reset-form.component";
import { PersonalNotes } from "./notes/personal/personal.component";
import { SharedNotes } from "./notes/shared/shared.component";
import { ScannedNotes } from "./notes/scanned/scanned.component";
import { AccountComponent } from "./account/account.component";

const routes: Routes = [
	{ path: "", component: HomeComponent, data: { animation: 'fader' }},
	{
		path: "notes",
		component: NotesComponent,
		data: { animation: 'fader' },
		children: [
			{ path: "", component: PersonalNotes , data: { animation: 'isRight' }},
			{ path: "personal", component: PersonalNotes, data: { animation: 'isLeft' } },
			{ path: "scanned", component: ScannedNotes , data: { animation: 'isRight' }},
			{ path: "shared", component: SharedNotes, data: { animation: '' } },
		],
	},
	{
		path: "account",
		component: AccountComponent,
		data: { animation: 'fader' },
		children: [
			{ path: "", component: LoginComponent , data: { animation: 'isRight' }},
			{ path: "forget", component: ForgotPasswordComponent, data: { animation: 'isLeft' } },
			{ path: "forgot/reset", component: ResetPasswordFrom, data: { animation: 'fader' } },
			{ path: "register", component: RegisterComponent , data: { animation: 'isRight' }},
			{ path: "login", component: LoginComponent, data: { animation: '' } },
		],
	},
	{ path: "chat", component: ChatComponent, data: { animation: 'fader' } }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
