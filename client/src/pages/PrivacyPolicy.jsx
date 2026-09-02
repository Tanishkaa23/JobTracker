import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Privacy Policy
        </h1>

        <p className="mb-8 text-sm text-gray-500">
          Last updated: August 18, 2026
        </p>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            1. Introduction
          </h2>

          <p className="leading-7 text-gray-700">
            Job Tracker ("we", "our", or "the application") is a job
            application management platform that helps users organize,
            track, and manage their job applications and interviews.
          </p>

          <p className="mt-3 leading-7 text-gray-700">
            This Privacy Policy explains what information Job Tracker
            collects, how that information is used, and how we protect
            your information.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            2. Information We Collect
          </h2>

          <p className="leading-7 text-gray-700">
            When you use Job Tracker, we may collect information that you
            provide directly, including:
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li>Name and email address</li>
            <li>Account login information</li>
            <li>Job application details</li>
            <li>Company and job information</li>
            <li>Interview dates and related information</li>
            <li>Other information that you choose to store in the application</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            4. How We Use Your Information
          </h2>

          <p className="leading-7 text-gray-700">
            We use the information collected to:
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li>Provide and maintain Job Tracker</li>
            <li>Manage your account</li>
            <li>Store and organize your job applications</li>
            <li>Help you track interviews and application status</li>
            <li>Send emails when you request or enable email features</li>
            <li>Improve the functionality and reliability of the application</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            6. Data Sharing
          </h2>

          <p className="leading-7 text-gray-700">
            We do not sell or rent your personal information.
          </p>

          <p className="mt-3 leading-7 text-gray-700">
            Information may be processed by third-party services that are
            necessary to operate the application, such as hosting,
            database, authentication, and email services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            7. Data Security
          </h2>

          <p className="leading-7 text-gray-700">
            We take reasonable technical and organizational measures to
            protect your information from unauthorized access, alteration,
            disclosure, or destruction. However, no internet-based service
            can guarantee complete security.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            9. Data Retention and Deletion
          </h2>

          <p className="leading-7 text-gray-700">
            We retain information for as long as necessary to provide the
            application's services or as required for legitimate purposes.
            You may request deletion of your account and associated
            personal information by contacting us.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            10. Changes to This Privacy Policy
          </h2>

          <p className="leading-7 text-gray-700">
            We may update this Privacy Policy from time to time. Any
            changes will be reflected on this page with an updated
            "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            11. Contact Us
          </h2>

          <p className="leading-7 text-gray-700">
            If you have any questions about this Privacy Policy or how
            Job Tracker handles your information, please contact us at:
          </p>

          <p className="mt-2 font-medium text-gray-900">
            tanishkagupta654@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;