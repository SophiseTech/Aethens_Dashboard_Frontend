const SECTIONS = [
  {
    title: "1. Pre-Registration",
    content: (
      <p>
        Submitting a pre-registration application does not guarantee admission to the diploma
        programme. It is an expression of interest and initiates the review process. Admission
        is subject to seat availability, document verification, and approval by the admissions
        team.
      </p>
    ),
  },
  {
    title: "2. Enrolment",
    content: (
      <p>
        To enrol in our academy, you must complete the registration process and provide
        accurate and complete information. You may be required to meet certain age or skill
        level requirements as specified by the academy.
      </p>
    ),
  },
  {
    title: "3. Accuracy of Information",
    content: (
      <p>
        You are responsible for ensuring that all information provided in the application is
        true, accurate, and complete. Any misrepresentation or falsification of information
        may result in immediate disqualification of the application or termination of
        enrolment, even after admission.
      </p>
    ),
  },
  {
    title: "4. Document Submission",
    content: (
      <ul className="flex flex-col gap-1 pl-5 list-disc">
        <li>All required documents must be submitted in the formats specified (PDF or image).</li>
        <li>Documents submitted must be legible and unaltered.</li>
        <li>School of Athens reserves the right to request original documents for verification at any stage.</li>
        <li>Submission of forged or altered documents will result in permanent disqualification.</li>
      </ul>
    ),
  },
  {
    title: "5. Use of Personal Data",
    content: (
      <p>
        The personal information you provide (including name, phone number, address, and
        uploaded documents) will be used solely for the purpose of processing your
        pre-registration and communicating with you regarding your application. Your data will
        not be shared with third parties without your consent, except as required by law.
      </p>
    ),
  },
  {
    title: "6. Communication",
    content: (
      <p>
        By submitting your application, you consent to being contacted by School of Athens
        via the phone number or contact information provided, for purposes related to your
        application, admission process, and programme updates.
      </p>
    ),
  },
  {
    title: "7. Batch Allocation",
    content: (
      <p>
        Your preferred batch is noted as a preference and is not a confirmed allocation. Final
        batch assignment is at the discretion of the admissions team based on availability and
        programme requirements.
      </p>
    ),
  },
  {
    title: "8. Fee and Payment",
    content: (
      <p>
        Pre-registration does not require any payment. Any fees applicable upon formal
        admission will be communicated separately. If you choose the month-wise payment
        option, the fee must be paid at the beginning of each month — this is mandatory even
        if you are absent for the month. Fee refund policies will be governed by the terms
        specified at the time of formal enrolment.
      </p>
    ),
  },
  {
    title: "9. Intellectual Property",
    content: (
      <p>
        All instructional materials, including but not limited to lesson plans and other
        content provided by the academy, are the property of School of Athens and are
        protected by intellectual property laws. You may not copy, distribute, or reproduce
        any instructional materials without the academy&apos;s explicit written permission.
      </p>
    ),
  },
  {
    title: "10. Respectful Behaviour",
    content: (
      <p>
        You must behave respectfully and professionally while participating in the academy.
        Any form of harassment, discrimination, or disruptive behaviour towards instructors
        or fellow students will not be tolerated and may result in removal from the programme.
      </p>
    ),
  },
  {
    title: "11. Use of Materials",
    content: (
      <p>
        You agree to use all art supplies, equipment, and facilities offered by the academy
        responsibly and in accordance with the instructions and guidelines provided. In the
        event of loss of student materials, the replacement may be made available at an
        additional cost.
      </p>
    ),
  },
  {
    title: "12. Attendance",
    content: (
      <p>
        Regular attendance is expected for all classes and sessions. If you cannot attend a
        class, please notify the academy in advance. Regular absences or delays may result in
        additional fees or impact your progress in the programme.
      </p>
    ),
  },
  {
    title: "13. Participation",
    content: (
      <p>
        Active participation and engagement in class activities and assignments are essential
        to your learning experience. Completion of homework or additional assignments may be
        required as part of the academy&apos;s programmes.
      </p>
    ),
  },
  {
    title: "14. Withdrawal and Refund",
    content: (
      <p>
        You may withdraw your application at any time before formal admission is confirmed by
        contacting the admissions team in writing. Once formally admitted and fees are paid,
        you may not be eligible for a refund. Withdrawal terms after admission are subject to
        the refund policy in effect at the time of enrolment.
      </p>
    ),
  },
  {
    title: "15. Limitation of Liability",
    content: (
      <p>
        To the maximum extent permitted by applicable law, School of Athens and its
        instructors shall not be liable for any injuries, damages, losses, or expenses arising
        out of or in connection with your participation in the academy, including but not
        limited to personal injury, property damage, or financial loss.
      </p>
    ),
  },
  {
    title: "16. Governing Law",
    content: (
      <p>
        This Agreement shall be governed by and construed in accordance with applicable laws.
        Any disputes arising out of or in connection with these terms shall be subject to the
        exclusive jurisdiction of the competent courts of the relevant jurisdiction.
      </p>
    ),
  },
  {
    title: "17. Changes to Terms",
    content: (
      <p>
        School of Athens reserves the right to update or modify these terms and conditions at
        any time. Changes will be posted on the website and will take effect immediately.
        Continued use of the application process after any changes constitutes acceptance of
        the updated terms.
      </p>
    ),
  },
  {
    title: "18. Contact",
    content: (
      <p>
        For any queries regarding these terms or the pre-registration process, please reach
        out to the admissions office at{" "}
        <a href="mailto:schoolofathens95@gmail.com" className="underline text-primary">
          schoolofathens95@gmail.com
        </a>
        .
      </p>
    ),
  },
];

function Section({ title, content }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <div className="text-sm leading-relaxed text-gray-600">{content}</div>
    </div>
  );
}

function TermsAndConditions() {
  return (
    <div className="flex justify-center px-4 py-10 min-h-screen bg-gray-50">
      <div className="flex flex-col gap-6 p-8 w-full max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-1">
          <img src="/images/logo.png" alt="School of Athens" className="mb-2 w-48" />
          <h1 className="text-2xl font-black text-gray-800">Terms and Conditions</h1>
          <p className="text-xs text-gray-400">Last updated: June 2025</p>
        </div>

        <p className="text-sm leading-relaxed text-gray-600">
          Please read these terms and conditions carefully before submitting your diploma
          pre-registration application to School of Athens. By submitting the form, and by
          enrolling in our academy, you acknowledge that you have read, understood, and agreed
          to be bound by all the terms and conditions set forth in this agreement.
        </p>

        {SECTIONS.map((section) => (
          <Section key={section.title} title={section.title} content={section.content} />
        ))}

        <div className="pt-4 text-xs text-gray-400 border-t border-gray-100">
          &copy; {new Date().getFullYear()} School of Athens. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
