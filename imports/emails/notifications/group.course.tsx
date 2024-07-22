{{#emailBase subject=subject site=site}}
  <tr>
    <td>
      <h5 class="title">
        {{i18n "email.base.greeting" USERNAME=username lng=locale}}
      </h5>
      <p>
        {{i18n "notification.group.course.mail.intro" '{CREATER} just proposed {COURSE} in your group {GROUPS}.' CREATER=creater.getDisplayName COURSE=course GROUPS=groups lng=locale}}
      </p>
      {{#if courseDescription}}
        <table class="comment-box">
          <tr>
            <td>
              {{{courseDescription}}}
            </td>
          </tr>
        </table>
      {{/if}}
      <p>
        {{i18n "notification.group.course.mail.next" "You can contact {CREATER} in order to support and help organizing {COURSE}. You have the possibility to edit the  description and announce events." CREATER=creater.getDisplayName COURSE=course lng=locale}}
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <table class="footer">
        <tr>
          <td>
            {{i18n "notification.group.course.mail.recpnote" "You receive this message because you're a member of {GROUPS}." GROUPS=groups lng=locale}}
          </td>
        </tr>
        <tr>
          <td>
            <a
               href="{{unsubLink}}">{{i18n "email.base.unsubscribeLink.automatedNotifications" SITENAME=siteName lng=locale}}</a>
            &nbsp;
            <a
               href="{{urlFor 'profile' query='campaign=groupCourseNotify'}}">{{i18n "email.base.profileLink" lng=locale}}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
{{/emailBase}}
