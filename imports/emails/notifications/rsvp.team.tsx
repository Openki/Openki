{{#emailBase subject=subject site=site}}
  <tr>
    <td>
      <h5 class="title">
        {{i18n "email.base.greeting" USERNAME=username lng=locale}}
      </h5>
      <p>
        {{i18n "notification.rsvp.team.mail.intro" '{COMPANIONS, plural, =0{{USERNAME} } other{{USERNAME} and companion } }just reserved a seat for event "{EVENT}".' USERNAME=newParticipant COMPANIONS=companionsOfNewParticipant EVENT=event lng=locale}}
      </p>
      <p>
        <strong>{{i18n "notification.rsvp.team.mail.statsOverview" 'Attendees now: {PARTICIPANTS}' PARTICIPANTS=participantsCount lng=locale}}</strong>
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <table class="footer">
        <tr>
          <td>
            {{i18n "email.base.receiveNote.courseTeam" COURSE=course lng=locale}}
          </td>
        </tr>
        <tr>
          <td>
            <a
               href="{{unsubLink}}">{{i18n "email.base.unsubscribeLink.automatedNotifications" SITENAME=siteName lng=locale}}</a>
            &nbsp;
            <a
               href="{{urlFor 'profile' query='campaign=rsvpTeamNotify'}}">{{i18n "email.base.profileLink" lng=locale}}</a>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 16px;">
            {{i18n "email.base.spamPrevention" MAIL=email lng=locale}}
          </td>
        </tr>
      </table>
    </td>
  </tr>
{{/emailBase}}
